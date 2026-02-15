// Node.js script to seed plans

const plans = [
    {
        name: "Basic Plan",
        type: "trial",
        price: 0,
        durationDays: 7,
        description: "Start small with our Basic Plan. Perfect for getting started.",
        features: ["Up to 5 machines", "Up to 3 operators", "Basic support"],
        isActive: true,
        displayOrder: 1
    },
    {
        name: "Monthly Plan",
        type: "monthly",
        price: 999,
        durationDays: 30,
        description: "Flexible monthly billing. Ideal for small businesses.",
        features: ["Unlimited machines", "Unlimited operators", "Priority support", "Advanced analytics"],
        isActive: true,
        displayOrder: 2
    },
    {
        name: "Quarterly Plan",
        type: "quarterly",
        price: 2499,
        durationDays: 90,
        description: "Save 17% with our Quarterly Plan. Best for growing businesses.",
        features: ["Unlimited machines", "Unlimited operators", "24/7 Premium support", "Advanced analytics", "Custom reports"],
        isActive: true,
        displayOrder: 3
    },
    {
        name: "Semi Annual Plan",
        type: "semi_annual",
        price: 4499,
        durationDays: 180,
        description: "Save 25% with our Semi-Annual Plan. Great for established businesses.",
        features: ["All quarterly features", "Custom reports", "Dedicated account manager", "API access"],
        isActive: true,
        displayOrder: 4
    },
    {
        name: "Annual Plan",
        type: "annual",
        price: 7999,
        durationDays: 365,
        description: "Best Value! Save 33% with our Annual Plan.",
        features: ["All features", "Dedicated limit", "Priority feature requests", "Phone support"],
        isActive: true,
        displayOrder: 5
    }
];

async function seedPlans(adminToken) {
    if (!adminToken) {
        console.error("Error: Please provide an ADMIN_TOKEN as an argument.");
        console.log("Usage: node scripts/seedPlans.js <YOUR_ADMIN_TOKEN>");
        process.exit(1);
    }

    const baseUrl = "https://backend.ssinfrasoftware.com/api/v1/plans";

    console.log("Starting to seed plans...");

    for (const plan of plans) {
        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                },
                body: JSON.stringify(plan)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`Failed to create plan "${plan.name}":`, data);
            } else {
                console.log(`✅ Successfully created plan "${plan.name}" (ID: ${data.plan?.id})`);
            }
        } catch (error) {
            console.error(`Error creating plan "${plan.name}":`, error.message);
        }
    }
    console.log("Seeding complete.");
}

// Run if called directly
if (require.main === module) {
    const token = process.argv[2];
    seedPlans(token);
}

module.exports = { plans, seedPlans };
