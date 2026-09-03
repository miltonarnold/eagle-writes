import { Router } from "express";
import { supabase } from "../server";

const router = Router();

/* GET ALL PAYMENTS */

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("payments")
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
            error: "Failed to retrieve payments."
        });
    }
});

/* CREATE PAYMENT */

router.post("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("payments")
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
            error: "Failed to create payment."
        });
    }
});

export default router;