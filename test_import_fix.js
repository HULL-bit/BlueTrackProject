#!/usr/bin/env node
/**
 * Script de test pour vérifier que l'erreur d'importation est résolue
 */

const fs = require('fs');
const path = require('path');

function checkImportFix() {
  console.log('🔍 Vérification de la correction de l\'erreur d\'importation...');
  
  // Vérifier que userDataPersistence est exporté depuis mediaService.ts
  const mediaServicePath = path.join(__dirname, 'src/services/mediaService.ts');
  
  if (!fs.existsSync(mediaServicePath)) {
    console.log('❌ Fichier mediaService.ts non trouvé');
    return false;
  }
  
  const mediaServiceContent = fs.readFileSync(mediaServicePath, 'utf8');
  
  if (mediaServiceContent.includes('export const userDataPersistence')) {
    console.log('✅ userDataPersistence est exporté depuis mediaService.ts');
  } else {
    console.log('❌ userDataPersistence n\'est pas exporté depuis mediaService.ts');
    return false;
  }
  
  // Vérifier que les fonctions nécessaires existent
  if (mediaServiceContent.includes('savePirogueImages')) {
    console.log('✅ Fonction savePirogueImages trouvée');
  } else {
    console.log('❌ Fonction savePirogueImages manquante');
    return false;
  }
  
  if (mediaServiceContent.includes('syncLocalData')) {
    console.log('✅ Fonction syncLocalData trouvée');
  } else {
    console.log('❌ Fonction syncLocalData manquante');
    return false;
  }
  
  // Vérifier que PirogueForm.tsx importe correctement
  const pirogueFormPath = path.join(__dirname, 'src/components/PirogueForm.tsx');
  
  if (!fs.existsSync(pirogueFormPath)) {
    console.log('❌ Fichier PirogueForm.tsx non trouvé');
    return false;
  }
  
  const pirogueFormContent = fs.readFileSync(pirogueFormPath, 'utf8');
  
  if (pirogueFormContent.includes("import { userDataPersistence } from '../services/mediaService'")) {
    console.log('✅ PirogueForm.tsx importe userDataPersistence correctement');
  } else {
    console.log('❌ Import incorrect dans PirogueForm.tsx');
    return false;
  }
  
  // Vérifier que Layout.tsx importe correctement
  const layoutPath = path.join(__dirname, 'src/components/Layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ Fichier Layout.tsx non trouvé');
    return false;
  }
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes("import { userDataPersistence } from '../services/mediaService'")) {
    console.log('✅ Layout.tsx importe userDataPersistence correctement');
  } else {
    console.log('❌ Import incorrect dans Layout.tsx');
    return false;
  }
  
  return true;
}

function main() {
  console.log('🚀 Test de correction de l\'erreur d\'importation');
  console.log('=' * 50);
  
  const isFixed = checkImportFix();
  
  console.log('\n' + '=' * 50);
  if (isFixed) {
    console.log('🎉 L\'erreur d\'importation a été corrigée !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ userDataPersistence est exporté depuis mediaService.ts');
    console.log('   ✅ Les fonctions savePirogueImages et syncLocalData existent');
    console.log('   ✅ Les imports dans PirogueForm.tsx et Layout.tsx sont corrects');
    console.log('\n🌐 Le serveur de développement devrait maintenant fonctionner sans erreur.');
  } else {
    console.log('❌ Des problèmes persistent. Vérifiez les modifications.');
  }
}

if (require.main === module) {
  main();
}
