import React, { useState,useEffect } from 'react'
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import {toast} from 'react-toastify';

const Login = () => {
  const [state, setState] = useState('Signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if(state === 'Signup'){

      const {data} = await axios.post(backendUrl+ '/api/user/register',{name,email,password});
      if(data?.success){
        localStorage.setItem('token', data?.token)
        setToken(data?.token)
      } else {
        toast.error(data?.message)
      }
    }
    else{
      const {data} = await axios.post(backendUrl+ '/api/user/login',{email,password});
      if(data?.success){
        localStorage.setItem('token', data?.token)
        setToken(data?.token)
      } else {
        toast.error(data?.message)
      }
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])


  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex flex-col items-center '>
       <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg '>

        <p className='text-2xl font-semibold'>{state === 'Signup' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Signup' ? 'Signup' : 'Login'} to Book Appointment</p>
      
       {
            state === "Signup" && 
          <div className='w-full'>
            <p>Full Name:</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required />
          </div>
       }
       <div className='w-full'>
        <p>Email:</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required />
       </div>
       <div className='w-full'>
        <p>Password:</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1'
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required />
       </div>
       <button className='bg-primary text-white text-base py-2 rounded-md w-full'>
        {state === 'Signup' ? 'Create Account' : 'Login'}
      </button>
      {
        state === "Signup" 
        ? <p>Already have an account? <span className='text-primary cursor-pointer underline' onClick={() => setState('Login')}>Login Here</span> </p>
        : <p>Don't have an account? <span className='text-primary cursor-pointer underline' onClick={() => setState('Signup')}>Create Account</span></p>
      }
       </div>
    </form>
  )
}

export default Login
