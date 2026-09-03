import { Router } from "express";
import { supabase } from "../server";

const router = Router();

/* GET ALL COURSES */

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to retrieve courses."
        });
    }
});

/* CREATE COURSE */

router.post("/", async (req, res) => {
    try {
        const { title, description, price } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({
                success: false,
                error: "Title and price are required."
            });
        }

        const { data, error } = await supabase
            .from("courses")
            .insert([
                {
                    title,
                    description: description || "",
                    price
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to create course."
        });
    }
});

export default router;