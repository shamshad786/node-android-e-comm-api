const Razorpay = require("razorpay");
exports.createPayment = async (req, res) => {
  const price = req.body.price;
  console.log(price)
  //console.log("requesting body",req.body.price);
  // if (req.method === "POST") {

  console.log("Hello i am razor pay from backend");
  // Initialize razorpay object
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  // Create an order -> generate the OrderID -> Send it to the Front-end
  const payment_capture = 1;
  const amount = price;
  const currency = "INR";
  const options = {
    amount: (amount * 100).toString(),
    currency,
    payment_capture,
  };
  try {
    const response = await razorpay.orders.create(options);
    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
  // } else {
  //   // Handle any other HTTP method
  // }
};
