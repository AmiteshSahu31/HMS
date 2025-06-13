import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';


//API to register user
export const registerUser= async(req,res) => {
    try {
        const {name,email,password}= req.body;

        if(!name || !email || !password){
            return res.json({success:false,message:"Missing Details"});
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"});
        }

        if(password.length < 8){
            return res.json({
                success:false,
                message:"Please enter a strong password",
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await userModel.create({
            name,
            email,
            password:hashedPassword,
        });

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);


        return res.json({
            success:true,
            user,
            token,
            message:"User registered successfully",
        });

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
        
    }
}

//API for login user
export const loginUser= async(req,res) => {
    try {
        const {email,password}= req.body;

        if(!email || !password){
            return res.json({success:false,message:"Missing Details"});
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"});
        }

      const user= await userModel.findOne({email});

      if(!user){
        return res.json({success:false,message:"User not found"});
      }

      const isMatch = await bcrypt.compare(password,user.password);

      if(!isMatch){
        return res.json({success:false,message:"Incorrect Password"});
      }
      if(isMatch){
        const token = jwt.sign({id:user?._id}, process.env.JWT_SECRET);
        return res.json({
            success:true,
            token,
            message:"User logged in successfully",
        });
      }
      else{
        return res.json({success:false,message:"User not found"});
      }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
        
    }
}

// API to get user profile data
 export const getProfile = async (req, res) => {

    try {
        const userId = req.userId;
        // console.log(userId);

        if (!userId) {
            return res.json({ success: false, message: "User not found" })
        }
        const userData = await userModel.findById(userId).select('-password')

        return res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// API to update user profile
 export const updateProfile = async (req, res) => {

    try {
        const userId = req.userId;
        const {name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
export const bookAppointment = async (req, res) => {

    try {

        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body;
        console.log("Print userId:", userId)
        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")
        console.log("User Data:",userData)

        if(!userData){
            return res.json({ success: false, message: 'User Not Found' })
        }

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked }, { new: true })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
export const listAppointment = async (req, res) => {
    try {
        const userId=req.userId;

        const appointments= await appointmentModel.find({userId});

        res.json({success:true,appointments});
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// API to cancel appointment
export const cancelAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData?.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance= new razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET 
});

// API to make payment of appointment using razorpay
export const paymentRazorpay = async (req, res) => {

    try {
        const {appointmentId}= req.body;

    const appointmentData= await appointmentModel.findById(appointmentId);

    if(!appointmentData && appointmentData.cancelled){
        return res.json({success:false,message:"Appointment cancelled or not found"});
    }

    //create options for razorpay payment
    const options={
        amount:appointmentData.amount*100,
        currency:process.env.CURRENCY,
        receipt: appointmentId,
    };

    //creation of an order
    const order= await razorpayInstance.orders.create(options);

    res.json({success:true,order});

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
        
    }
}

//  //API to verify razorpay payment
//  export const verifyRazorpay = async (req, res) => {
//     try {
//         const {razorpay?.}
        
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:error.message});
        
//     }
//  }