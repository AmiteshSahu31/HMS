import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext';

const Login = () => {

  const [state,setState] = useState('Admin');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const {setAToken,backendUrl} =useContext(AdminContext);
  const {setDToken} = useContext(DoctorContext);

  const onSubmitHandler= async (e) => {
    e.preventDefault();

    try {
      if(state === 'Admin'){
        const {data} = await axios.post(backendUrl+ '/api/admin/login',{email,password});
        if(data?.success){
          // console.log(data?.token);
          localStorage.setItem('aToken',data?.token);
          setAToken(data?.token);
          toast.success(data?.message);
          console.log("Success")
        }
      }
        else{
          const {data} = await axios.post(backendUrl+ '/api/doctor/login',{email,password});
          if(data?.success){
            console.log(data?.token);
            localStorage.setItem('dToken',data?.token);
            setDToken(data?.token);
            toast.success(data?.message);
            // console.log("Success")
          }
          else{
            toast.error(data?.message);
          }
        }
      
    } catch (error) {
      console.log(error.message)
    }
    
  }


  return (
   <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
    <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg '>
      <p className='text-2xl font-semibold m-auto'>{state} <span className='text-primary'>Login</span></p>
      <div className='w-full'>
        <p>Email</p>
        <input type="email" required className='border border-[#DADADA] rounded w-full p-2 mt-1'
        value={email}
        onChange={(e) => setEmail(e.target.value)}/>
      </div>
      <div className='w-full'>
        <p>Password</p>
        <input type="password" required className='border border-[#DADADA] rounded w-full p-2 mt-1'
        value={password}
        onChange={(e) => setPassword(e.target.value)}/>
      </div>
      <button className='bg-primary text-white text-base py-2 rounded-md w-full'>Login</button>
      {
        state === 'Admin' ? <p>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary cursor-pointer underline '>Click here</span></p> 
        : <p>Admin Login? <span onClick={() => setState('Admin')} className='text-primary cursor-pointer underline '>Click here</span></p> 
      } 
    </div>
   </form>
  )
}

export default Login
