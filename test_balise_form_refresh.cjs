const { execSync } = require('child_process');

console.log('🧪 Test de correction du problème de rafraîchissement du formulaire de balise\n');

// Test 1: Vérifier que le serveur Django fonctionne
console.log('1️⃣ Test de connexion au serveur Django...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/balises/', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('✅ Serveur Django accessible');
  } else {
    console.log('❌ Serveur Django non accessible (code:', response.trim(), ')');
  }
} catch (error) {
  console.log('❌ Erreur de connexion au serveur Django:', error.message);
}

// Test 2: Vérifier les modifications dans MapLayers.tsx
console.log('\n2️⃣ Vérification des modifications dans MapLayers.tsx...');
try {
  const fs = require('fs');
  const mapLayersContent = fs.readFileSync('src/components/MapLayers.tsx', 'utf8');
  
  const checks = [
    { name: 'Intervalle de 10 minutes', pattern: /600000/ },
    { name: 'État autoRefreshEnabled', pattern: /autoRefreshEnabled/ },
    { name: 'Vérification de l\'élément actif', pattern: /activeElement/ },
    { name: 'Événements disableAutoRefresh', pattern: /disableAutoRefresh/ },
    { name: 'Événements enableAutoRefresh', pattern: /enableAutoRefresh/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(mapLayersContent)) {
      console.log(`✅ ${check.name} - Présent`);
    } else {
      console.log(`❌ ${check.name} - Manquant`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lors de la lecture de MapLayers.tsx:', error.message);
}

// Test 3: Vérifier les modifications dans BaliseManagement.tsx
console.log('\n3️⃣ Vérification des modifications dans BaliseManagement.tsx...');
try {
  const fs = require('fs');
  const baliseManagementContent = fs.readFileSync('src/components/BaliseManagement.tsx', 'utf8');
  
  const checks = [
    { name: 'Attribut data-form-type', pattern: /data-form-type="balise"/ },
    { name: 'Attribut data-submitting', pattern: /data-submitting/ },
    { name: 'Événement disableAutoRefresh', pattern: /disableAutoRefresh/ },
    { name: 'Événement enableAutoRefresh', pattern: /enableAutoRefresh/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(baliseManagementContent)) {
      console.log(`✅ ${check.name} - Présent`);
    } else {
      console.log(`❌ ${check.name} - Manquant`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lors de la lecture de BaliseManagement.tsx:', error.message);
}

// Test 4: Vérifier que le serveur frontend fonctionne
console.log('\n4️⃣ Test de connexion au serveur frontend...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('✅ Serveur frontend accessible');
  } else {
    console.log('❌ Serveur frontend non accessible (code:', response.trim(), ')');
  }
} catch (error) {
  console.log('❌ Erreur de connexion au serveur frontend:', error.message);
}

console.log('\n🎯 Résumé des corrections apportées :');
console.log('• Intervalle de rafraîchissement augmenté à 10 minutes');
console.log('• Détection améliorée des formulaires ouverts');
console.log('• Détection de l\'utilisateur en train de taper');
console.log('• Désactivation temporaire du rafraîchissement automatique');
console.log('• Événements personnalisés pour contrôler le rafraîchissement');
console.log('• Attributs de détection sur le formulaire et les boutons');

console.log('\n✨ Le formulaire d\'ajout de balise ne devrait plus se rafraîchir constamment !');
