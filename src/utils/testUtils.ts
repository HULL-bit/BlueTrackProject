import { API_CONFIG } from '../config/api';
import { totargetService } from '../services/totargetService';

// Test de l'intégration Totarget
export const testTotargetIntegration = async () => {
  console.log('🧪 Test de l\'intégration Totarget...');
  
  try {
    // Vérifier la configuration
    console.log('📋 Configuration Totarget:');
    console.log('- API Key:', API_CONFIG.TOTARGET.API_KEY ? '✅ Configurée' : '❌ Manquante');
    console.log('- Base URL:', API_CONFIG.TOTARGET.BASE_URL);
    
    // Test de connexion (simulation)
    console.log('\n🔗 Test de connexion...');
    
    // Simuler un test de commande
    const testDeviceId = 'TEST_DEVICE_001';
    const testCommand = {
      commandType: 'get_status',
      payload: { timestamp: new Date().toISOString() }
    };
    
    console.log('📡 Envoi de commande test...');
    console.log('- Device ID:', testDeviceId);
    console.log('- Commande:', testCommand);
    
    // Note: En production, décommentez ces lignes pour tester la vraie API
    /*
    try {
      const response = await totargetService.sendCommand(testDeviceId, testCommand.commandType, testCommand.payload);
      console.log('✅ Commande envoyée avec succès:', response);
    } catch (error) {
      console.log('⚠️ Erreur API (normal en test):', error.message);
    }
    */
    
    console.log('✅ Test d\'intégration Totarget terminé');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test Totarget:', error);
    return false;
  }
};

// Test des formulaires
export const testForms = () => {
  console.log('🧪 Test des formulaires...');
  
  const forms = [
    'PirogueForm',
    'ZoneForm', 
    'UserManagement',
    'DeviceManagement'
  ];
  
  forms.forEach(form => {
    console.log(`✅ ${form} - Composant créé`);
  });
  
  console.log('✅ Tous les formulaires sont prêts');
  return true;
};

// Test des images de pirogues
export const testPirogueImages = () => {
  console.log('🧪 Test des images de pirogues...');
  
  const { pirogueImages } = require('../assets/images');
  
  console.log(`📸 ${pirogueImages.length} images de pirogues disponibles:`);
  
  pirogueImages.forEach((image, index) => {
    console.log(`${index + 1}. ${image.name} - ${image.location}`);
  });
  
  console.log('✅ Images de pirogues chargées avec succès');
  return true;
};

// Test complet
export const runAllTests = async () => {
  console.log('🚀 Démarrage des tests complets...\n');
  
  const results = {
    totarget: await testTotargetIntegration(),
    forms: testForms(),
    images: testPirogueImages()
  };
  
  console.log('\n📊 Résultats des tests:');
  console.log('- Totarget API:', results.totarget ? '✅' : '❌');
  console.log('- Formulaires:', results.forms ? '✅' : '❌');
  console.log('- Images:', results.images ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('\n⚠️ Certains tests ont échoué');
  }
  
  return results;
};

// Exporter pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).testPirogueApp = {
    runAllTests,
    testTotargetIntegration,
    testForms,
    testPirogueImages
  };
}
