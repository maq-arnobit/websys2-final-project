'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('substances', [
      // Global Imports substances
      {
        substance_id: 1,
        provider_id: 1,
        substanceName: 'Caffeine Powder',
        category: 'Stimulants',
        description: 'Pure caffeine powder, pharmaceutical grade, 99.9% purity'
      },
      {
        substance_id: 2,
        provider_id: 1,
        substanceName: 'Vitamin C (Ascorbic Acid)',
        category: 'Vitamins',
        description: 'High-quality vitamin C powder, buffered formula'
      },
      {
        substance_id: 3,
        provider_id: 1,
        substanceName: 'Creatine Monohydrate',
        category: 'Supplements',
        description: 'Micronized creatine monohydrate for better absorption'
      },
      {
        substance_id: 4,
        provider_id: 1,
        substanceName: 'L-Theanine',
        category: 'Amino Acids',
        description: 'Pure L-theanine extracted from green tea'
      },
      // Local Source substances
      {
        substance_id: 5,
        provider_id: 2,
        substanceName: 'Protein Powder (Whey)',
        category: 'Supplements',
        description: 'Whey protein isolate, vanilla flavor, 90% protein content'
      },
      {
        substance_id: 6,
        provider_id: 2,
        substanceName: 'Magnesium Citrate',
        category: 'Minerals',
        description: 'Bioavailable magnesium supplement for muscle and nerve function'
      },
      {
        substance_id: 7,
        provider_id: 2,
        substanceName: 'Green Tea Extract',
        category: 'Herbs',
        description: 'Standardized green tea catechins, 50% EGCG'
      },
      {
        substance_id: 8,
        provider_id: 2,
        substanceName: 'Beta-Alanine',
        category: 'Amino Acids',
        description: 'Pure beta-alanine for endurance and performance'
      },
      // Premium Supply substances
      {
        substance_id: 9,
        provider_id: 3,
        substanceName: 'Omega-3 Fish Oil',
        category: 'Supplements',
        description: 'High EPA/DHA fish oil concentrate, molecularly distilled'
      },
      {
        substance_id: 10,
        provider_id: 3,
        substanceName: 'CoQ10 (Ubiquinone)',
        category: 'Antioxidants',
        description: 'Premium coenzyme Q10 for cellular energy production'
      },
      {
        substance_id: 11,
        provider_id: 3,
        substanceName: 'Turmeric Extract',
        category: 'Herbs',
        description: '95% curcuminoids standardized extract with black pepper'
      },
      {
        substance_id: 12,
        provider_id: 3,
        substanceName: 'Ashwagandha Extract',
        category: 'Adaptogens',
        description: 'KSM-66 ashwagandha root extract, clinically studied'
      },
      // Budget Wholesale substances
      {
        substance_id: 13,
        provider_id: 4,
        substanceName: 'Multivitamin Blend',
        category: 'Vitamins',
        description: 'Budget-friendly comprehensive vitamin and mineral mix'
      },
      {
        substance_id: 14,
        provider_id: 4,
        substanceName: 'Basic Protein Mix',
        category: 'Supplements',
        description: 'Economy protein blend, unflavored'
      },
      // International Traders substances
      {
        substance_id: 15,
        provider_id: 5,
        substanceName: 'Rhodiola Rosea Extract',
        category: 'Adaptogens',
        description: 'Premium Siberian rhodiola extract, 3% rosavins'
      },
      {
        substance_id: 16,
        provider_id: 5,
        substanceName: 'Ginseng Extract',
        category: 'Herbs',
        description: 'Korean red ginseng extract, 8% ginsenosides'
      },
      {
        substance_id: 17,
        provider_id: 5,
        substanceName: 'Spirulina Powder',
        category: 'Superfoods',
        description: 'Organic spirulina powder, high in protein and nutrients'
      },
      // Organic Sources substances
      {
        substance_id: 18,
        provider_id: 6,
        substanceName: 'Organic Matcha Powder',
        category: 'Superfoods',
        description: 'Ceremonial grade organic matcha from Japan'
      },
      {
        substance_id: 19,
        provider_id: 6,
        substanceName: 'Hemp Protein Powder',
        category: 'Supplements',
        description: 'Organic hemp protein, complete amino acid profile'
      },
      {
        substance_id: 20,
        provider_id: 6,
        substanceName: 'Chlorella Powder',
        category: 'Superfoods',
        description: 'Broken cell wall chlorella for maximum bioavailability'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('substances', null, {});
  }
};
