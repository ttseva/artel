import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Message from "./models/Message.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/artel";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Message.deleteMany({});

    const buyers = await User.create([
      {
        name: "Анна Петрова",
        email: "anna@example.com",
        password: "password123",
        role: "buyer",
      },
      {
        name: "Игорь Смирнов",
        email: "igor@example.com",
        password: "password123",
        role: "buyer",
      },
    ]);

    const masters = await User.create([
      {
        name: "Мария Керамист",
        email: "maria@example.com",
        password: "password123",
        role: "master",
      },
      {
        name: "Дмитрий Столяр",
        email: "dmitry@example.com",
        password: "password123",
        role: "master",
      },
    ]);

    const products = await Product.create([
      {
        masterId: masters[0]._id,
        title: "Керамическая чашка ручной работы",
        description:
          "Уникальная чашка из белой глины с авторской росписью. Объем 350 мл.",
        price: 1200,
        image: "https://placehold.co/300x400",
        category: "decor",
      },
      {
        masterId: masters[0]._id,
        title: "Набор керамических тарелок",
        description: 'Комплект из 4 тарелок с узором "волны". Диаметр 25 см.',
        price: 3500,
        image: "https://placehold.co/300x400",
        category: "decor",
      },
      {
        masterId: masters[0]._id,
        title: "Керамическая ваза",
        description:
          "Элегантная ваза ручной работы высотой 30 см. Глазурь морской волны.",
        price: 2800,
        image: "https://placehold.co/300x400",
        category: "decor",
      },
      {
        masterId: masters[1]._id,
        title: "Деревянная разделочная доска",
        description: "Доска из дуба с гравировкой. Размер 40x25 см.",
        price: 1500,
        image: "https://placehold.co/300x400",
        category: "accessories",
      },
      {
        masterId: masters[1]._id,
        title: "Шкатулка из ореха",
        description:
          "Резная шкатулка ручной работы с инкрустацией. Размер 15x10x8 см.",
        price: 2200,
        image: "https://placehold.co/300x400",
        category: "decor",
      },
      {
        masterId: masters[1]._id,
        title: "Деревянные серьги-луночки",
        description:
          "Ажурные серьги из шпона березы, покрытые воском. Гипоаллергенны, очень легкие (3 гр.).",
        price: 750,
        image: "https://placehold.co/300x400",
        category: "jewelry",
      },
    ]);

    const orders = await Order.create([
      {
        buyerId: buyers[0]._id,
        masterId: masters[0]._id,
        productId: products[0]._id,
        status: "completed",
        comment: "Возможно ли сделать такую же кружку, но в синем цвете?",
      },
      {
        buyerId: buyers[0]._id,
        masterId: masters[1]._id,
        productId: products[3]._id,
        status: "in_progress",
        comment: "Гравировка с инициалами А.П.",
      },
      {
        buyerId: buyers[1]._id,
        masterId: masters[0]._id,
        productId: products[1]._id,
        status: "created",
        comment: "",
      },
    ]);

    const messages = await Message.create([
      {
        orderId: orders[0]._id,
        senderId: buyers[0]._id,
        text: "Здравствуйте! Когда можно забрать заказ?",
      },
      {
        orderId: orders[0]._id,
        senderId: masters[0]._id,
        text: "Добрый день! Чашка готова, можете забрать в любое удобное время.",
      },
      {
        orderId: orders[1]._id,
        senderId: buyers[0]._id,
        text: "Можно сделать гравировку с инициалами?",
      },
      {
        orderId: orders[1]._id,
        senderId: masters[1]._id,
        text: "Конечно! Какие инициалы нужны?",
      },
      {
        orderId: orders[2]._id,
        senderId: buyers[1]._id,
        text: "Добрый день! Интересует набор тарелок. Можно посмотреть вживую?",
      },
    ]);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();
