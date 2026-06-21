const PDFDocument = require('pdfkit');

class PdfService {
  /**
   * Génère le PDF de rapport statistique Cisco
   */
  static async buildCiscoReport(data, res) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Pipe le document directement dans la réponse HTTP
        doc.pipe(res);

        // --- EN-TÊTE ADMINISTRATIF ---
        doc.fontSize(10)
           .text("MINISTÈRE DE L'ÉDUCATION NATIONALE", { align: 'center' })
           .text("DIRECTION RÉGIONALE DE L'ÉDUCATION", { align: 'center' })
           .moveDown(2);

        // --- TITRE PRINCIPAL ---
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('Rapport statistique des enseignants - Cisco', { align: 'center', underline: true })
           .moveDown(2);

        // --- INFORMATIONS GÉNÉRALES ---
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('1. Informations Générales')
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Cisco : ${data.cisco_nom}`)
           .text(`Date de génération : ${data.date_generation}`)
           .moveDown(1.5);

        // --- STATISTIQUES PAR COMMUNE ---
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('2. Détail des statistiques par Commune')
           .moveDown(1);

        let totalBesoinCisco = 0;

        data.communes.forEach((commune, index) => {
          totalBesoinCisco += commune.besoin_recrutement;

          doc.fontSize(11)
             .font('Helvetica-Bold')
             .fillColor('#003366')
             .text(`  ├── Commune : ${commune.nom_commune}`);
             
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('black')
             .text(`  │     ├── Fonctionnaires : ${commune.fonctionnaire}`)
             .text(`  │     ├── Contractuels : ${commune.contractuel}`)
             .text(`  │     ├── FRAM sub : ${commune.fram_sub}`)
             .text(`  │     ├── FRAM non sub : ${commune.fram_non_sub}`)
             .text(`  │     ├── Autres : ${commune.autres}`)
             .text(`  │     ├── Total enseignants : ${commune.total}`)
             .text(`  │     ├── Besoin recrutement : ${commune.besoin_recrutement}`)
             .moveDown(1);
        });

        // --- RÉSULTAT GLOBAL ---
        doc.moveDown(1);
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('3. Bilan de Recrutement Global')
           .moveDown(0.5);

        // --- PHRASE FINALE OBLIGATOIRE ---
        doc.fontSize(13)
           .font('Helvetica-Oblique')
           .fillColor('#B22222') // Rouge foncé pour mise en évidence
           .text(`"Le besoin estimé en recrutement d'enseignants pour ce Cisco est de : ${totalBesoinCisco} enseignants."`, {
             align: 'center'
           });

        // --- SIGNATURE OU PIED DE PAGE ---
        doc.moveDown(4);
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica')
           .text('Document généré automatiquement par le Système de Gestion.', { align: 'center' });

        doc.end();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PdfService;
