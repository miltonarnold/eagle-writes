import { Router } from "express";
import { supabase } from "../server";

const router = Router();

/* GET ALL MESSAGES */

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("messages")
            .select("*");

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
            error: "Failed to retrieve messages."
        });
    }
});

/* CREATE MESSAGE */

router.post("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("messages")
            .insert([req.body])
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
            error: "Failed to create message."
        });
    }
});

export default router;