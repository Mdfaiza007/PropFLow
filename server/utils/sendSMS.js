import twilio from "twilio";

const sendSMS = async (options) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.phone,
    });

    console.log("SMS sent: %s", message.sid);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

export default sendSMS;;
