import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync"

const givePrescription = catchAsync(async (req : Request, res :Response));

con