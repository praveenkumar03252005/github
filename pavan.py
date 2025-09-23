#!/usr/bin/env python3
import logging
import re
from difflib import SequenceMatcher
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Your bot token
BOT_TOKEN = '8480767618:AAGokXuZLmlgDc66L_k9zf80r1iVhrCC8pM'

# Animal database with properties and behaviors
ANIMAL_DATA = {
    # Mammals
    'lion': {
        'type': 'Mammal',
        'habitat': 'Savanna and grasslands',
        'diet': 'Carnivore',
        'lifespan': '10-14 years in wild',
        'behavior': 'Lions are social animals living in prides. They are apex predators known for their hunting skills and territorial nature. Males are protective of their pride and territory.'
    },
    'elephant': {
        'type': 'Mammal',
        'habitat': 'Forests and savannas',
        'diet': 'Herbivore',
        'lifespan': '60-70 years',
        'behavior': 'Elephants are highly intelligent and social animals with strong family bonds. They show empathy, have excellent memory, and communicate through various sounds and gestures.'
    },
    'tiger': {
        'type': 'Mammal',
        'habitat': 'Forests and grasslands',
        'diet': 'Carnivore',
        'lifespan': '10-15 years in wild',
        'behavior': 'Tigers are solitary hunters, excellent swimmers, and highly territorial. They are known for their stealth and powerful hunting abilities, primarily active during dawn and dusk.'
    },
    'dog': {
        'type': 'Mammal',
        'habitat': 'Domestic/Various',
        'diet': 'Omnivore',
        'lifespan': '10-13 years',
        'behavior': 'Dogs are loyal, social, and highly trainable companions. They form strong bonds with humans, are protective of their family, and communicate through barking, body language, and facial expressions.'
    },
    'cat': {
        'type': 'Mammal',
        'habitat': 'Domestic/Various',
        'diet': 'Carnivore',
        'lifespan': '12-18 years',
        'behavior': 'Cats are independent yet affectionate animals. They are natural hunters, very clean, and territorial. They communicate through purring, meowing, and body language.'
    },
    'monkey': {
        'type': 'Mammal',
        'habitat': 'Tropical forests',
        'diet': 'Omnivore',
        'lifespan': '15-25 years',
        'behavior': 'Monkeys are highly social and intelligent primates living in groups. They are playful, curious, and use various vocalizations and gestures to communicate with each other.'
    },
    'bear': {
        'type': 'Mammal',
        'habitat': 'Forests and mountains',
        'diet': 'Omnivore',
        'lifespan': '20-30 years',
        'behavior': 'Bears are generally solitary animals except during mating season. They are excellent climbers and swimmers, hibernate in winter, and are very protective of their cubs.'
    },
    'horse': {
        'type': 'Mammal',
        'habitat': 'Grasslands/Domestic',
        'diet': 'Herbivore',
        'lifespan': '25-30 years',
        'behavior': 'Horses are social animals that form herds in the wild. They are intelligent, have excellent memory, and communicate through neighing, body postures, and facial expressions.'
    },
    'giraffe': {
        'type': 'Mammal',
        'habitat': 'African savannas',
        'diet': 'Herbivore',
        'lifespan': '20-25 years',
        'behavior': 'Giraffes are gentle giants that live in loose herds. They use their long necks to reach high vegetation and have a complex social structure with silent communication through body language.'
    },
    'zebra': {
        'type': 'Mammal',
        'habitat': 'African grasslands',
        'diet': 'Herbivore',
        'lifespan': '20-30 years',
        'behavior': 'Zebras are social animals living in family groups. Their unique stripe patterns help with identification and may confuse predators. They are always alert and quick to flee from danger.'
    },

    # Birds
    'eagle': {
        'type': 'Bird',
        'habitat': 'Mountains and forests',
        'diet': 'Carnivore',
        'lifespan': '20-30 years',
        'behavior': 'Eagles are powerful predators with exceptional eyesight. They are territorial, build large nests, and are known for their soaring flight patterns and hunting prowess.'
    },
    'parrot': {
        'type': 'Bird',
        'habitat': 'Tropical forests',
        'diet': 'Omnivore',
        'lifespan': '20-80 years',
        'behavior': 'Parrots are highly intelligent and social birds capable of mimicking sounds and human speech. They are playful, curious, and form strong pair bonds with mates.'
    },
    'penguin': {
        'type': 'Bird',
        'habitat': 'Antarctic regions',
        'diet': 'Carnivore (fish)',
        'lifespan': '15-20 years',
        'behavior': 'Penguins are social birds living in large colonies. They are excellent swimmers, mate for life, and take turns caring for their eggs and chicks.'
    },
    'owl': {
        'type': 'Bird',
        'habitat': 'Forests and fields',
        'diet': 'Carnivore',
        'lifespan': '5-25 years',
        'behavior': 'Owls are nocturnal hunters with exceptional hearing and silent flight. They are generally solitary, territorial, and known for their distinctive hooting calls.'
    },
    'peacock': {
        'type': 'Bird',
        'habitat': 'Forests and parks',
        'diet': 'Omnivore',
        'lifespan': '15-25 years',
        'behavior': 'Peacocks are known for their spectacular tail displays during courtship. They are social birds that roost in trees and have loud, distinctive calls.'
    },

    # Reptiles
    'snake': {
        'type': 'Reptile',
        'habitat': 'Various environments',
        'diet': 'Carnivore',
        'lifespan': '10-30 years',
        'behavior': 'Snakes are solitary predators that swallow prey whole. They shed their skin regularly, are cold-blooded, and use their forked tongues to sense their environment.'
    },
    'crocodile': {
        'type': 'Reptile',
        'habitat': 'Rivers and swamps',
        'diet': 'Carnivore',
        'lifespan': '35-75 years',
        'behavior': 'Crocodiles are ambush predators that are excellent swimmers. They are territorial, protective parents, and can remain motionless for hours while waiting for prey.'
    },
    'turtle': {
        'type': 'Reptile',
        'habitat': 'Water and land',
        'diet': 'Omnivore',
        'lifespan': '50-100+ years',
        'behavior': 'Turtles are generally slow-moving and peaceful animals. They retreat into their shells when threatened and many species migrate long distances for nesting.'
    },
    'lizard': {
        'type': 'Reptile',
        'habitat': 'Deserts and forests',
        'diet': 'Omnivore',
        'lifespan': '5-20 years',
        'behavior': 'Lizards are cold-blooded reptiles that bask in the sun to regulate body temperature. Many can detach their tails when threatened and are excellent climbers.'
    },

    # Aquatic animals
    'dolphin': {
        'type': 'Mammal',
        'habitat': 'Oceans',
        'diet': 'Carnivore (fish)',
        'lifespan': '20-45 years',
        'behavior': 'Dolphins are highly intelligent and social marine mammals. They live in pods, use echolocation for navigation, play games, and show empathy towards other dolphins.'
    },
    'whale': {
        'type': 'Mammal',
        'habitat': 'Oceans',
        'diet': 'Varies by species',
        'lifespan': '50-90 years',
        'behavior': 'Whales are gentle giants that migrate vast distances. They communicate through complex songs, live in family groups, and some species are known for their acrobatic behaviors.'
    },
    'shark': {
        'type': 'Fish',
        'habitat': 'Oceans',
        'diet': 'Carnivore',
        'lifespan': '20-100+ years',
        'behavior': 'Sharks are apex predators with excellent senses. Most are solitary hunters, constantly moving to breathe, and play crucial roles in maintaining ocean ecosystem balance.'
    },
    'octopus': {
        'type': 'Mollusk',
        'habitat': 'Ocean floors',
        'diet': 'Carnivore',
        'lifespan': '1-5 years',
        'behavior': 'Octopuses are highly intelligent invertebrates capable of problem-solving and camouflage. They are solitary animals with excellent memory and can use tools.'
    },

    # Farm animals
    'cow': {
        'type': 'Mammal',
        'habitat': 'Grasslands/Farms',
        'diet': 'Herbivore',
        'lifespan': '18-22 years',
        'behavior': 'Cows are social animals that form herds and friendships. They are curious, have excellent memories, and communicate through various moos and body language.'
    },
    'pig': {
        'type': 'Mammal',
        'habitat': 'Farms/Forests',
        'diet': 'Omnivore',
        'lifespan': '12-20 years',
        'behavior': 'Pigs are highly intelligent and social animals. They are curious, playful, and excellent problem solvers. They enjoy wallowing in mud to cool down and protect their skin.'
    },
    'chicken': {
        'type': 'Bird',
        'habitat': 'Farms/Various',
        'diet': 'Omnivore',
        'lifespan': '5-10 years',
        'behavior': 'Chickens are social birds with complex communication systems. They establish pecking orders, are protective of their young, and can recognize over 100 different faces.'
    },
    'sheep': {
        'type': 'Mammal',
        'habitat': 'Grasslands/Farms',
        'diet': 'Herbivore',
        'lifespan': '10-12 years',
        'behavior': 'Sheep are social animals that follow a flock mentality for protection. They have excellent memories, recognize faces, and form close bonds with other sheep.'
    },
    'goat': {
        'type': 'Mammal',
        'habitat': 'Mountains/Farms',
        'diet': 'Herbivore',
        'lifespan': '10-18 years',
        'behavior': 'Goats are curious, intelligent, and excellent climbers. They are social animals that live in herds and are known for their playful and mischievous nature.'
    },

    # Insects
    'bee': {
        'type': 'Insect',
        'habitat': 'Gardens and forests',
        'diet': 'Nectar and pollen',
        'lifespan': '15-38 days (workers)',
        'behavior': 'Bees are social insects living in organized colonies. They communicate through dancing, work together efficiently, and play crucial roles in pollinating plants.'
    },
    'butterfly': {
        'type': 'Insect',
        'habitat': 'Gardens and fields',
        'diet': 'Nectar',
        'lifespan': '2 weeks to 8 months',
        'behavior': 'Butterflies undergo complete metamorphosis and are important pollinators. They migrate long distances, are attracted to bright colors, and taste with their feet.'
    },
    'ant': {
        'type': 'Insect',
        'habitat': 'Various environments',
        'diet': 'Omnivore',
        'lifespan': '1-3 years',
        'behavior': 'Ants are highly organized social insects living in colonies. They work together, communicate through pheromones, and can carry objects many times their body weight.'
    }
}

# Create a set of animal names for quick lookup
ANIMAL_NAMES = set(ANIMAL_DATA.keys())

def normalize_text(text):
    """Normalize text by removing extra spaces, converting to lowercase, etc."""
    if not text:
        return ""
    return re.sub(r'[^\w\s]', '', text.lower().strip())

def similarity(a, b):
    """Calculate similarity between two strings using SequenceMatcher."""
    return SequenceMatcher(None, a, b).ratio()

def find_closest_animal(user_input):
    """Find the closest animal match using string similarity."""
    normalized_input = normalize_text(user_input)
    
    # Direct match first
    if normalized_input in ANIMAL_NAMES:
        return normalized_input
    
    # Find closest match using similarity
    best_match = None
    best_similarity = 0
    threshold = 0.6  # Similarity threshold
    
    for animal in ANIMAL_NAMES:
        sim = similarity(normalized_input, animal)
        if sim > threshold and sim > best_similarity:
            best_similarity = sim
            best_match = animal
    
    return best_match

def could_be_animal(text):
    """Check if input might be an animal using basic NLP rules."""
    if not text:
        return False
        
    normalized_text = normalize_text(text)
    
    # Check if it's reasonable length (most animal names are 1-2 words)
    words = normalized_text.split()
    if len(words) > 3:
        return False
    
    # Check if it contains numbers (unlikely for animal names)
    if re.search(r'\d', normalized_text):
        return False
    
    # Check for common non-animal indicators
    non_animal_indicators = {
        'car', 'phone', 'computer', 'book', 'table', 'chair', 'house', 'building',
        'food', 'water', 'fire', 'air', 'rock', 'stone', 'metal', 'plastic',
        'hello', 'hi', 'thanks', 'thank', 'please', 'help', 'how', 'what', 'where',
        'when', 'why', 'who', 'yes', 'no', 'maybe', 'okay', 'ok', 'good', 'bad',
        'nice', 'cool', 'awesome', 'great', 'terrible', 'love', 'hate'
    }
    
    return normalized_text not in non_animal_indicators

def format_animal_info(animal_name, data):
    """Format animal information for display."""
    return (
        f"🐾 *{animal_name.upper()}*\n\n"
        f"📝 *Properties:*\n"
        f"• Type: {data['type']}\n"
        f"• Habitat: {data['habitat']}\n"
        f"• Diet: {data['diet']}\n"
        f"• Lifespan: {data['lifespan']}\n\n"
        f"🎭 *Behavior:*\n{data['behavior']}"
    )

# Command handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /start is issued."""
    welcome_message = (
        "🤖 Welcome to the Animal Information Bot!\n\n"
        "Simply send me the name of any animal, and I'll tell you:\n"
        "• 4 key properties (type, habitat, diet, lifespan)\n"
        "• Behavioral information\n\n"
        "Try sending me: \"lion\", \"elephant\", \"dolphin\", or any other animal name!\n\n"
        "Commands:\n"
        "/help - Show help message\n"
        "/animals - See list of available animals"
    )
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /help is issued."""
    help_message = (
        "🆘 *How to use this bot:*\n\n"
        "1\\. Send me any animal name \\(e\\.g\\., \"tiger\", \"eagle\", \"shark\"\\)\n"
        "2\\. I'll respond with 4 properties and behavior info\n"
        "3\\. If it's not an animal, I'll let you know\n\n"
        "*Available commands:*\n"
        "/start \\- Welcome message\n"
        "/help \\- This help message\n"
        "/animals \\- List of animals I know about"
    )
    await update.message.reply_text(help_message, parse_mode=ParseMode.MARKDOWN_V2)

async def animals_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send list of available animals."""
    animal_list = ', '.join(sorted(ANIMAL_DATA.keys()))
    message = (
        f"🦁 *Animals I know about:*\n\n"
        f"{animal_list}\n\n"
        f"Just type any of these animal names to get detailed information!"
    )
    await update.message.reply_text(message, parse_mode=ParseMode.MARKDOWN)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages."""
    user_input = update.message.text
    chat_id = update.effective_chat.id
    
    logger.info(f"Received message: '{user_input}' from chat {chat_id}")
    
    # Check if the input could potentially be an animal
    if not could_be_animal(user_input):
        await update.message.reply_text(
            f'❌ "{user_input}" is not an animal. Please send me an animal name like "lion", "eagle", or "dolphin".'
        )
        return
    
    # Try to find the closest matching animal
    closest_animal = find_closest_animal(user_input)
    
    if closest_animal:
        animal_info = ANIMAL_DATA[closest_animal]
        formatted_info = format_animal_info(closest_animal, animal_info)
        
        await update.message.reply_text(formatted_info, parse_mode=ParseMode.MARKDOWN)
    else:
        await update.message.reply_text(
            f'❌ Sorry, "{user_input}" doesn\'t appear to be an animal I recognize.\n\n'
            f'Try one of these animals: lion, tiger, elephant, eagle, dolphin, shark, dog, cat...\n\n'
            f'Or use /animals to see the full list!'
        )

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    """Log errors caused by Updates."""
    logger.error(f"Exception while handling an update: {context.error}")

def main():
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(BOT_TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("animals", animals_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Register error handler
    application.add_error_handler(error_handler)

    # Start the bot
    print("🤖 Animal Information Bot is running...")
    print("Bot username: @papakkagaribot")
    print("Waiting for messages...")
    
    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()