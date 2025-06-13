import express from 'express';
import { loginAdmin, addDoctor, getAllDoctors, getAllAppointments, appointmentCancel, adminDashboard } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';
import upload from '../middlewares/multer.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.post('/all-doctors',authAdmin,getAllDoctors);
adminRouter.post('/change-availability', authAdmin, changeAvailability);
adminRouter.get('/appointments',authAdmin,getAllAppointments);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);
adminRouter.get('/dashboard',authAdmin,adminDashboard);

export default adminRouter;