import mongoose from 'mongoose';
import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";

export const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ObjectId format"
      });
    }

    // Find doctor
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Toggle availability
    const updatedDoc = await doctorModel.findByIdAndUpdate(
      docId,
      { available: !doctor?.available },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      updatedDoc,
      message: "Availability changed successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password","-email"]);
    return res.status(200).json({
      success: true,
      doctors,
      message: "Doctors fetched successfully"
    });
  } catch (error) {
    console.error(error);
  }
}

//API for doctor login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, doctor?.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect Password" });
    }

    if (isMatch) {
      const token = jwt.sign({ id: doctor?._id }, process.env.JWT_SECRET);
      return res.json({
        success: true,
        token,
        message: "Doctor logged in successfully",
      });
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get doctor appointments for doctor panel
export const appointmentsDoctor= async(req,res) => {
  try {
    const docId= req.docId;

    const appointments= await appointmentModel.find({docId});

    res.json({success:true,appointments});
    
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

//API to mark appointment complete for doctor panel
export const appointmentComplete= async(req,res) => {
  try {
    const docId= req.docId;
    const {appointmentId}= req.body;

    const appointmentData= await appointmentModel.findById(appointmentId);

    if(appointmentData && appointmentData?.docId === docId){
      await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted:true}, {new:true});
      res.json({success:true,message:"Appointment marked completed"});
    }
    else {
      res.json({success:false,message:"Mark Failed"});
    }
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
    
  }
}

//API to cancel the appointment for doctor
export const appointmentCancel= async(req,res) => {
  try {
    const docId= req.docId;
    const {appointmentId}= req.body;

    const appointmentData= await appointmentModel.findById(appointmentId);

    if(appointmentData && appointmentData?.docId === docId){
      await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true}, {new:true});
      res.json({success:true,message:"Appointment marked completed"});
    }
    else {
      res.json({success:false,message:"Mark Failed"});
    }
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
    
  }
}

// API to get dashboard data for doctor panel
export const doctorDashboard = async (req, res) => {
    try {
        const docId = req.docId;
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0;

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) { //if not then add the patients to array
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to get the doctor profile for doctor panel
export const doctorProfile = async (req, res) => {
    try {
        const docId = req.docId;
        const profileData = await doctorModel.findById(docId).select("-password");

        res.json({ success: true, profileData });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to update the doctor profile for doctor panel
export const updateDoctorProfile = async (req, res) => {
  try {
    const docId= req.docId;
    const {fees, available, address}= req.body;

    await doctorModel.findByIdAndUpdate(docId, {fees, available, address}, {new:true});

    res.json({success:true, message:"Profile Updated"});

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
    
  }
}