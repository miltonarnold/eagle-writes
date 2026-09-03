import { Router } from "express";
import { supabase } from "../server";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/* ===============================
   SIGN UP
================================ */

router.post("/signup", async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required."
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name || ""
                }
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("SIGNUP ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Signup failed."
        });
    }
});

/* ===============================
   LOGIN
================================ */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required."
            });
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        return res.json({
            success: true,
            message: "Login successful.",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Login failed."
        });
    }
});

/* ===============================
   UPDATE PASSWORD
================================ */

router.post("/update-password", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication token is missing."
            });
        }

        // Verify the recovery token
        const userClient = createClient(
            supabaseUrl,
            supabaseKey
        );

        const {
            data: { user },
            error: authError
        } = await userClient.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired reset link."
            });
        }

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: "New password is required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters."
            });
        }

        // Admin client updates the authenticated user's password
        const adminClient = createClient(
            supabaseUrl,
            supabaseSecretKey
        );

        const { error: updateError } =
            await adminClient.auth.admin.updateUserById(
                user.id,
                {
                    password
                }
            );

        if (updateError) {
            console.error(
                "PASSWORD UPDATE ERROR:",
                updateError
            );

            return res.status(500).json({
                success: false,
                error: updateError.message
            });
        }

        return res.json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("UPDATE PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Password update failed."
        });
    }
});

/* ===============================
   LOGOUT
================================ */

router.post("/logout", async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Logout failed."
        });
    }
});

export default router;