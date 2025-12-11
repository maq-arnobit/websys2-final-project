'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('substances', [
    { provider_id: 1, substanceName: 'Caffeine Powder', category: 'Stimulants', description: 'Pure caffeine powder, pharmaceutical grade, 99.9% purity' },
    { provider_id: 1, substanceName: 'Vitamin C (Ascorbic Acid)', category: 'Vitamins', description: 'High-quality vitamin C powder, buffered formula' },
    { provider_id: 1, substanceName: 'Creatine Monohydrate', category: 'Supplements', description: 'Micronized creatine monohydrate for better absorption' },
    { provider_id: 1, substanceName: 'L-Theanine', category: 'Amino Acids', description: 'Pure L-theanine extracted from green tea' },

    { provider_id: 2, substanceName: 'Protein Powder (Whey)', category: 'Supplements', description: 'Whey protein isolate, vanilla flavor, 90% protein content' },
    { provider_id: 2, substanceName: 'Magnesium Citrate', category: 'Minerals', description: 'Bioavailable magnesium supplement for muscle and nerve function' },
    { provider_id: 2, substanceName: 'Green Tea Extract', category: 'Herbs', description: 'Standardized green tea catechins, 50% EGCG' },
    { provider_id: 2, substanceName: 'Beta-Alanine', category: 'Amino Acids', description: 'Pure beta-alanine for endurance and performance' },

    { provider_id: 3, substanceName: 'Omega-3 Fish Oil', category: 'Supplements', description: 'High EPA/DHA fish oil concentrate, molecularly distilled' },
    { provider_id: 3, substanceName: 'CoQ10 (Ubiquinone)', category: 'Antioxidants', description: 'Premium coenzyme Q10 for cellular energy production' },
    { provider_id: 3, substanceName: 'Turmeric Extract', category: 'Herbs', description: '95% curcuminoids standardized extract with black pepper' },
    { provider_id: 3, substanceName: 'Ashwagandha Extract', category: 'Adaptogens', description: 'KSM-66 ashwagandha root extract, clinically studied' },

    { provider_id: 4, substanceName: 'Multivitamin Blend', category: 'Vitamins', description: 'Budget-friendly comprehensive vitamin and mineral mix' },
    { provider_id: 4, substanceName: 'Basic Protein Mix', category: 'Supplements', description: 'Economy protein blend, unflavored' },

    { provider_id: 5, substanceName: 'Rhodiola Rosea Extract', category: 'Adaptogens', description: 'Premium Siberian rhodiola extract, 3% rosavins' },
    { provider_id: 5, substanceName: 'Ginseng Extract', category: 'Herbs', description: 'Korean red ginseng extract, 8% ginsenosides' },
    { provider_id: 5, substanceName: 'Spirulina Powder', category: 'Superfoods', description: 'Organic spirulina powder, high in protein and nutrients' },

    { provider_id: 6, substanceName: 'Organic Matcha Powder', category: 'Superfoods', description: 'Ceremonial grade organic matcha from Japan' },
    { provider_id: 6, substanceName: 'Hemp Protein Powder', category: 'Supplements', description: 'Organic hemp protein, complete amino acid profile' },
    { provider_id: 6, substanceName: 'Chlorella Powder', category: 'Superfoods', description: 'Broken cell wall chlorella for maximum bioavailability' },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('substances', {}, {});
}
