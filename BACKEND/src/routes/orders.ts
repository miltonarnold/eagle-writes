import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;

// Client used to verify the logged-in user
const authSupabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

// Server-side Supabase client used for order database operations
const adminSupabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

/* ================================
   CREATE ORDER
================================ */

router.post("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const token = authHeader.substring(7).trim();

        // Verify logged-in user
        const {
            data: { user },
            error: authError
        } = await authSupabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired authentication token."
            });
        }

        const { course_id, amount, status } = req.body;

        if (!course_id) {
            return res.status(400).json({
                success: false,
                error: "course_id is required."
            });
        }

        if (amount === undefined || amount === null) {
            return res.status(400).json({
                success: false,
                error: "amount is required."
            });
        }

        // Create order linked to the authenticated user
        const { data, error } = await adminSupabase
            .from("orders")
            .insert({
                user_id: user.id,
                course_id: course_id,
                amount: amount,
                status: status || "pending"
            })
            .select()
            .single();

        if (error) {
            console.error("ORDER DATABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            data: data
        });

    } catch (error) {
        console.error("ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to create order."
        });
    }
});

/* ================================
   GET ORDERS
================================ */

router.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const token = authHeader.substring(7).trim();

        // Verify logged-in user
        const {
            data: { user },
            error: authError
        } = await authSupabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired authentication token."
            });
        }

        // Get only this user's orders
        const { data, error } = await adminSupabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "GET ORDERS DATABASE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        return res.json({
            success: true,
            data: data || []
        });

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to retrieve orders."
        });
    }
});

export default router;