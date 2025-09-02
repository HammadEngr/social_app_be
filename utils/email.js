import nodemailer from "nodemailer";
import pug from "pug";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: "",
          pass: "",
        },
      });
    } else {
      return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER_EMAIL,
          pass: process.env.MAILTRAP_USER_PASSWORD,
        },
      });
    }
  }

  // 1. send emails
  async send(subject, template) {
    const htmlTemplate = pug.renderFile(
      `${__dirname}/../views/${template}.pug`,
      { firstName: this.firstName, url: this.url }
    );

    const mailOptions = {
      from: "hammadahmed.engineer@gmail.com",
      to: "hammadahmed.engr@gmail.com",
      subject: subject,
      text: "hello world",
      html: htmlTemplate,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // 2. send activation link on signup
  async sendActivationLink(activationLink) {
    await this.send("Activate your account", activationLink);
  }
}

export default Email;
