import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample hardware with Nepali Rupee prices
const sampleHardware = [
  {
    name: "Electric Drill",
    category: "Power Tools",
    description: "Professional 18V cordless drill with lithium battery",
    price: 11500.00,  // NPR
    rentalPricePerDay: 1800.00,  // NPR per day
    stockQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500"
  },
  {
    name: "Circular Saw",
    category: "Power Tools",
    description: "Heavy duty 7-1/4 inch circular saw",
    price: 16500.00,
    rentalPricePerDay: 2500.00,
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500"
  },
  {
    name: "Hammer",
    category: "Hand Tools",
    description: "Steel claw hammer with rubber grip",
    price: 2500.00,
    rentalPricePerDay: 350.00,
    stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1603281873175-ce8c0bea71cf?w=500"
  },
  {
    name: "Wrench Set",
    category: "Hand Tools",
    description: "Complete metric and SAE wrench set",
    price: 6300.00,
    rentalPricePerDay: 950.00,
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1614505241840-c98f1c4e8925?w=500"
  },
  {
    name: "Extension Ladder 20ft",
    category: "Equipment",
    description: "Aluminum extension ladder, 250 lb capacity",
    price: 25500.00,
    rentalPricePerDay: 3800.00,
    stockQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1619976215249-e29ab62d82dc?w=500"
  },
  {
    name: "Impact Driver",
    category: "Power Tools",
    description: "High-torque impact driver with quick-change chuck",
    price: 12700.00,
    rentalPricePerDay: 2200.00,
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500"
  },
  {
    name: "Tape Measure 25ft",
    category: "Hand Tools",
    description: "Retractable measuring tape with magnetic tip",
    price: 1600.00,
    rentalPricePerDay: 250.00,
    stockQuantity: 30,
    imageUrl: "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500"
  },
  {
    name: "Angle Grinder",
    category: "Power Tools",
    description: "4.5-inch angle grinder for cutting and grinding",
    price: 10200.00,
    rentalPricePerDay: 1500.00,
    stockQuantity: 7,
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500"
  },
  {
    name: "Tool Box",
    category: "Storage",
    description: "Heavy-duty rolling tool chest with 7 drawers",
    price: 38200.00,
    rentalPricePerDay: null,  // Not available for rent, buy only
    stockQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1587213811864-1e62ed923f66?w=500"
  },
  {
    name: "Safety Goggles",
    category: "Safety Equipment",
    description: "Impact-resistant safety glasses with anti-fog coating",
    price: 1200.00,
    rentalPricePerDay: null,  // Not available for rent
    stockQuantity: 50,
    imageUrl: "https://images.unsplash.com/photo-1626788126607-e388f24c87c4?w=500"
  },
  {
    name: "Jigsaw",
    category: "Power Tools",
    description: "Variable speed jigsaw for precise cutting",
    price: 8900.00,
    rentalPricePerDay: 1400.00,
    stockQuantity: 9,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500"
  },
  {
    name: "Paint Sprayer",
    category: "Painting Equipment",
    description: "High-volume low-pressure paint sprayer",
    price: 15800.00,
    rentalPricePerDay: 2800.00,
    stockQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500"
  },
  {
    name: "Nail Gun",
    category: "Power Tools",
    description: "Pneumatic framing nail gun",
    price: 14200.00,
    rentalPricePerDay: 2400.00,
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500"
  },
  {
    name: "Screwdriver Set",
    category: "Hand Tools",
    description: "20-piece precision screwdriver set",
    price: 2800.00,
    rentalPricePerDay: 400.00,
    stockQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1614505241840-c98f1c4e8925?w=500"
  },
  {
    name: "Work Gloves",
    category: "Safety Equipment",
    description: "Leather palm work gloves (1 pair)",
    price: 850.00,
    rentalPricePerDay: null,
    stockQuantity: 100,
    imageUrl: "https://images.unsplash.com/photo-1626788126607-e388f24c87c4?w=500"
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seed with NPR prices...');

  try {
    // Clear existing hardware (optional)
    console.log('🗑️ Clearing existing hardware...');
    await prisma.hardware.deleteMany();

    // Insert sample hardware
    console.log('➕ Adding sample hardware with Nepali Rupee prices...');
    for (const item of sampleHardware) {
      const hardware = await prisma.hardware.create({
        data: item
      });
      console.log(`✅ Created: ${hardware.name} - NPR ${hardware.price}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📦 Added ${sampleHardware.length} hardware items`);
    console.log('💰 All prices in Nepali Rupees (NPR)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();