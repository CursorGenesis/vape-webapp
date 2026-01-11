"""
VapeShop Telegram Bot
Бот для приёма заказов из Web App
"""

import os
import json
import logging
from datetime import datetime
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup, MenuButtonWebApp
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ========================================
# Конфигурация
# ========================================

# Токен бота (получить у @BotFather)
BOT_TOKEN = os.environ.get('BOT_TOKEN', '8489085503:AAHJZ1Zozy722-_o8V8GYLwmXeszNqkge6M')

# URL вашего веб-приложения (после размещения на хостинге)
# Для локального тестирования можно использовать ngrok или подобные сервисы
WEBAPP_URL = os.environ.get('WEBAPP_URL', 'https://cursorgenesis.github.io/vape-webapp/')

# ID администратора для получения уведомлений о заказах
ADMIN_CHAT_ID = os.environ.get('1024587738', None)

# ========================================
# Обработчики команд
# ========================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - открывает Web App"""
    
    user = update.effective_user
    
    # Создаём кнопку для открытия Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🛒 Открыть каталог",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_message = (
        f"Привет, {user.first_name}! 👋\n\n"
        "🚬 Добро пожаловать в *VapeShop*!\n\n"
        "У нас вы найдёте широкий ассортимент одноразовых электронных сигарет:\n"
        "• Elf Bar\n"
        "• HQD\n"
        "• Waka\n"
        "• Lost Mary\n\n"
        "Нажмите кнопку ниже, чтобы открыть каталог и оформить заказ! 👇"
    )
    
    await update.message.reply_text(
        welcome_message,
        parse_mode='Markdown',
        reply_markup=reply_markup
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /help"""
    
    help_text = (
        "📚 *Справка по боту VapeShop*\n\n"
        "*Доступные команды:*\n"
        "/start - Открыть каталог товаров\n"
        "/help - Показать эту справку\n"
        "/contact - Связаться с нами\n\n"
        "*Как сделать заказ:*\n"
        "1. Нажмите /start или кнопку меню\n"
        "2. Выберите товары в каталоге\n"
        "3. Добавьте их в корзину\n"
        "4. Оформите заказ\n\n"
        "После оформления мы свяжемся с вами для подтверждения! 📞"
    )
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def contact_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /contact"""
    
    contact_text = (
        "📞 *Контакты VapeShop*\n\n"
        "📱 Телефон: +7 (999) 123-45-67\n"
        "📧 Email: support@vapeshop.ru\n"
        "⏰ Работаем: 10:00 - 22:00\n\n"
        "Мы на связи и готовы помочь! 💬"
    )
    
    await update.message.reply_text(contact_text, parse_mode='Markdown')


async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик данных из Web App (заказы)"""
    
    try:
        # Получаем данные из Web App
        data = json.loads(update.effective_message.web_app_data.data)
        user = update.effective_user
        
        logger.info(f"Получен заказ от {user.id}: {data}")
        
        # Формируем текст заказа
        order_items = "\n".join([
            f"  • {item['name']} x{item['quantity']} = {item['price'] * item['quantity']} ₽"
            for item in data.get('items', [])
        ])
        
        customer = data.get('customer', {})
        delivery_type = "Курьер 🚗" if data.get('delivery') == 'courier' else "Самовывоз 🏪"
        
        order_text = (
            f"✅ *Заказ успешно оформлен!*\n\n"
            f"🆔 Номер заказа: #{datetime.now().strftime('%Y%m%d%H%M%S')}\n\n"
            f"📦 *Товары:*\n{order_items}\n\n"
            f"💰 *Итого:* {data.get('total', 0)} ₽\n\n"
            f"👤 *Получатель:*\n"
            f"  Имя: {customer.get('name', 'Не указано')}\n"
            f"  Телефон: {customer.get('phone', 'Не указан')}\n"
            f"  Адрес: {customer.get('address', 'Не указан')}\n\n"
            f"🚚 *Доставка:* {delivery_type}\n\n"
            f"Мы свяжемся с вами в ближайшее время! 📞"
        )
        
        # Отправляем подтверждение пользователю
        await update.message.reply_text(order_text, parse_mode='Markdown')
        
        # Отправляем уведомление администратору
        if ADMIN_CHAT_ID:
            admin_text = (
                f"🔔 *НОВЫЙ ЗАКАЗ!*\n\n"
                f"👤 От: {user.first_name} (@{user.username or 'нет username'})\n"
                f"🆔 User ID: {user.id}\n\n"
                f"📦 *Товары:*\n{order_items}\n\n"
                f"💰 *Сумма:* {data.get('total', 0)} ₽\n\n"
                f"📋 *Данные клиента:*\n"
                f"  Имя: {customer.get('name', 'Не указано')}\n"
                f"  Телефон: {customer.get('phone', 'Не указан')}\n"
                f"  Адрес: {customer.get('address', 'Не указан')}\n\n"
                f"🚚 *Доставка:* {delivery_type}"
            )
            
            try:
                await context.bot.send_message(
                    chat_id=ADMIN_CHAT_ID,
                    text=admin_text,
                    parse_mode='Markdown'
                )
            except Exception as e:
                logger.error(f"Ошибка отправки уведомления админу: {e}")
        
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка парсинга данных Web App: {e}")
        await update.message.reply_text(
            "❌ Произошла ошибка при обработке заказа. Пожалуйста, попробуйте ещё раз."
        )
    except Exception as e:
        logger.error(f"Ошибка обработки заказа: {e}")
        await update.message.reply_text(
            "❌ Произошла ошибка. Пожалуйста, свяжитесь с нами через /contact"
        )


async def unknown_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик неизвестных команд"""
    
    await update.message.reply_text(
        "🤔 Не понимаю эту команду.\n"
        "Используйте /help для списка доступных команд."
    )


async def post_init(application: Application) -> None:
    """Настройка бота после инициализации"""
    
    # Устанавливаем кнопку меню с Web App
    await application.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="🛒 Каталог",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    
    logger.info("Бот успешно запущен!")


def main() -> None:
    """Запуск бота"""
    
    if BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("="*50)
        print("⚠️  ВНИМАНИЕ!")
        print("="*50)
        print("\nУстановите токен бота одним из способов:\n")
        print("1. Переменная окружения:")
        print("   set BOT_TOKEN=ваш_токен")
        print("\n2. Или отредактируйте файл bot.py:")
        print("   BOT_TOKEN = 'ваш_токен'\n")
        print("Получить токен можно у @BotFather в Telegram")
        print("="*50)
        return
    
    # Создаём приложение
    application = Application.builder().token(BOT_TOKEN).post_init(post_init).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("contact", contact_command))
    
    # Обработчик данных из Web App
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Обработчик неизвестных команд
    application.add_handler(MessageHandler(filters.COMMAND, unknown_command))
    
    # Запускаем бота
    print("🤖 Бот VapeShop запущен!")
    print("Нажмите Ctrl+C для остановки")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
