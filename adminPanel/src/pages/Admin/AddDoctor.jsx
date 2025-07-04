import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'



const AddDoctor = () => {
   const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    // const { backendUrl } = useContext(AppContext)
    const {backendUrl, aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
      event.preventDefault()

      try {

          if (!docImg) {
              return toast.error('Image Not Selected')
          }

          const formData = new FormData();

          formData.append('image', docImg) // this 'image' is created by multer
          formData.append('name', name)
          formData.append('email', email)
          formData.append('password', password)
          formData.append('experience', experience)
          formData.append('fees', Number(fees))
          formData.append('about', about)
          formData.append('speciality', speciality)
          formData.append('degree', degree)
          formData.append('address', JSON.stringify({ line1: address1, line2: address2 })) //only string data is send

          // console log formdata            
          formData.forEach((value, key) => {
              console.log(`${key}: ${value}`);
          });

          const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })
          if (data?.success) {
              toast.success(data?.message)
              //now reset all the details for the next doctor
              setDocImg(false)
              setName('')
              setPassword('')
              setEmail('')
              setAddress1('')
              setAddress2('')
              setDegree('')
              setAbout('')
              setFees('')
          } else {
              toast.error(data?.message)
          }

      } catch (error) {
          toast.error(error.message)
          console.log(error)
      }

  }
  
  return (
   <form className='m-5 w-full' onSubmit={onSubmitHandler}>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>

      <div className='bg-white p-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div  className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>Upload Doctor <br /> Picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div className='flex flex-col flex-1 gap-1'>
              <p>Your Name</p>
              <input type="text"
              placeholder='Name' required 
              value={name} onChange={(e) => setName(e.target.value)}
              className='border rounded px-3 py-2'/>
            </div>
            <div className='flex flex-col flex-1 gap-1'>
              <p>Doctor Email</p>
              <input type="email"
              placeholder='email' required 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className='border rounded px-3 py-2'/>
            </div>
            <div className='flex flex-col flex-1 gap-1'>
              <p>Doctor Password</p>
              <input type="password"
              placeholder='Password' required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className='border rounded px-3 py-2' />
            </div>
            <div className='flex flex-col flex-1 gap-1'>
              <p>Experience</p>
              <select className='border rounded px-3 py-2'
              value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>
            <div className='flex flex-col flex-1 gap-1'>
              <p>Fees</p>
              <input type="number"
              placeholder='Fees' required
              value={fees} onChange={(e) => setFees(e.target.value)}
              className='border rounded px-3 py-2' />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div className='flex flex-col flex-1 gap-1'>
              <p>Speciality</p>
              <select className='border rounded px-3 py-2' value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='flex flex-col flex-1 gap-1'>
              <p>Degree</p>
              <input type="text" placeholder='Degree' required 
              value={degree} onChange={(e) => setDegree(e.target.value)}
              className='border rounded px-3 py-2' />
            </div>

            <div className='flex flex-col flex-1 gap-1'>
              <p>Address</p>
              <input type="text" placeholder='Address 1' required className='border rounded px-3 py-2' 
              value={address1} onChange={(e) => setAddress1(e.target.value)}/>
              <input type="text" placeholder="Address 2" required className='border rounded px-3 py-2'
              value={address2} onChange={(e) => setAddress2(e.target.value)}/>
            </div>
            
          </div>
          
        </div>

        <div>
          <p className='mt-4 mb-2'>About Doctor</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' placeholder='Write about doctor' rows={5} required />
        </div>

        <button className='bg-primary text-white rounded-full mt-4 px-10 py-3'>Add Doctor</button>
      </div>

   </form>
  )
}

export default AddDoctor
