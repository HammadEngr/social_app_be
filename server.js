import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import postsRouter from "./routes/posts.routes.js";
import globalErrorHandler from "./error_handler/globalErrorHandler.js";
import fs from "fs";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

const port = process.env.PORT;

// db uri
const uri = "mongodb://127.0.0.1:27017/myFirstDb";

let server;
const startServer = async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });

    server = app.listen(port, () => {
      console.log(`Listening to port ${port}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = () => {
  // Use synchronous writes for critical shutdown messages
  process.stdout.write("Shutting down gracefully...\n");

  server.close(() => {
    process.stdout.write("Express server closed.\n");

    mongoose.connection.close(() => {
      process.stdout.write("Database connection closed.\n");
      process.exit(0);
    });
  });
};

// Listen for termination signals from the OS or Ctrl+C
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/posts", postsRouter);
app.use(globalErrorHandler);

let css_f = ":root {\n";

const css_colors = async () => {
  try {
    const colors_json = JSON.parse(
      fs.readFileSync("tailwind_full_colors.json", "utf-8")
    );
    const keys = Object.keys(colors_json);
    for (let color in colors_json) {
      const shades = colors_json[color];
      for (let shade in shades) {
        const hex_code = shades[shade];
        css_f += `--${color}-${shade}: ${hex_code};\n`;
      }
    }
    css_f += "}";
  } catch (error) {
    console.log(error);
  }
};
// css_colors();
// fs.writeFileSync("tailwind_colors.css", css_f);
