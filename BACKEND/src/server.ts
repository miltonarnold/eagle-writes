import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import servicesRouter from "./routes/services";
import coursesRouter from "./routes/courses";
import ordersRouter from "./routes/orders";
import messagesRouter from "./routes/messages";
import paymentsRouter from "./routes/payments";
import authRouter from "./routes/auth";
import emailRouter from "./routes/email";

dotenv.config();

const app = express();
const PORT = 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

/*
 * Default Supabase client.
 * Used for public/database operations.
 */
export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

/*
 * Create a Supabase client using the user's
 * Authorization Bearer token.
 *
 * This allows Supabase RLS to recognize
 * the authenticated user.
 */
export const getSupabaseClient = (req: express.Request) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.replace("Bearer ", "").trim();

    return createClient(
        supabaseUrl,
        supabaseKey,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "EAGLE WRITES Backend is running successfully!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .limit(1);

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: "EAGLE WRITES is connected to Supabase!",
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Database request failed."
        });
    }
});

app.use("/api/services", servicesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/email", emailRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log("=================================");
    console.log("EAGLE WRITES BACKEND");
    console.log(`PORT: ${PORT}`);
    console.log("SERVICES API: /api/services");
    console.log("COURSES API: /api/courses");
    console.log("ORDERS API: /api/orders");
    console.log("MESSAGES API: /api/messages");
    console.log("PAYMENTS API: /api/payments");
    console.log("AUTH API: /api/auth");
    console.log("EMAIL API: /api/email");
    console.log("=================================");
});