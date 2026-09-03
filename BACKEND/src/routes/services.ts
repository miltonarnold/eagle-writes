import { Router } from "express";
import { supabase } from "../server";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("services")
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
            error: "Failed to retrieve services."
        });
    }
});

export default router;