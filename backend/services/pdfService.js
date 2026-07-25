const PDFDocument = require('pdfkit-table');

class PdfService {
  /**
   * Génère le PDF de rapport statistique Cisco
   */
  static async buildCiscoReport(data, res) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        // Pipe le document directement dans la réponse HTTP
        doc.pipe(res);

        // --- DESIGN EN-TÊTE ---
        doc.rect(0, 0, doc.page.width, 100).fill('#1E3A8A');
        
        doc.fillColor('white')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 0, 30, { align: 'center' })
           .fontSize(10)
           .font('Helvetica')
           .text("DIRECTION RÉGIONALE DE L'ÉDUCATION", 0, 45, { align: 'center' });

        doc.fillColor('white')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('RAPPORT STATISTIQUE : ' + (data.cisco_nom || 'CISCO').toUpperCase(), 0, 70, { align: 'center' });

        // Reset fill color for body
        doc.fillColor('#333333');
        doc.moveDown(4);

        // --- INFORMATIONS GÉNÉRALES ---
        doc.fontSize(11).font('Helvetica-Bold').text(`Date de génération :`, 40, 120, { continued: true })
           .font('Helvetica').text(` ${data.date_generation}`);
        
        let totalBesoinCisco = 0;
        let totalEnseignantsCisco = 0;

        // Préparer les données pour le tableau
        const tableRows = data.communes.map(c => {
          totalBesoinCisco += (c.besoin_recrutement || 0);
          totalEnseignantsCisco += (c.total || 0);

          return [
            c.nom_commune,
            String(c.fonctionnaire || 0),
            String(c.contractuel || 0),
            String(c.fram_sub || 0),
            String(c.fram_non_sub || 0),
            String(c.autres || 0),
            String(c.total || 0),
            String(c.besoin_recrutement || 0)
          ];
        });

        // Ajouter une ligne de Total à la fin
        tableRows.push([
          "TOTAL GLOBAL",
          "", "", "", "", "",
          String(totalEnseignantsCisco),
          String(totalBesoinCisco)
        ]);

        doc.moveDown(2);

        // --- DESSINER LE TABLEAU ---
        const table = {
          title: "Répartition des Enseignants par Commune",
          headers: [
            { label: "Commune", property: 'nom', width: 120, renderer: null },
            { label: "Fonct.", property: 'fonc', width: 45, renderer: null },
            { label: "Contr.", property: 'cont', width: 45, renderer: null },
            { label: "FR. sub", property: 'fsub', width: 50, renderer: null },
            { label: "FR. non sub", property: 'fnon', width: 70, renderer: null },
            { label: "Autres", property: 'aut', width: 45, renderer: null },
            { label: "Total", property: 'tot', width: 50, renderer: null },
            { label: "Besoin", property: 'bes', width: 50, renderer: null }
          ],
          rows: tableRows,
        };

        await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(9);
            // Colorier la ligne de total
            if (indexRow === tableRows.length - 1) {
              doc.addBackground(rectRow, '#E5E7EB', 0.15);
              doc.font("Helvetica-Bold").fillColor('#1E3A8A');
            } else if (indexRow % 2 === 0) {
              doc.addBackground(rectRow, '#F9FAFB', 0.15);
            }
          },
          padding: 5
        });

        // --- RÉSULTAT GLOBAL ---
        doc.moveDown(2);
        
        doc.rect(40, doc.y, doc.page.width - 80, 50).fillAndStroke('#FEF2F2', '#DC2626');
        doc.fillColor('#991B1B')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`"Le besoin estimé en recrutement d'enseignants pour ce Cisco est de : ${totalBesoinCisco} enseignants."`, 40, doc.y - 35, {
             align: 'center',
             width: doc.page.width - 80
           });

        // --- PIED DE PAGE ---
        doc.on('pageAdded', () => {
          const bottom = doc.page.height - 30;
          doc.fillColor('#9CA3AF')
             .fontSize(8)
             .font('Helvetica')
             .text('Document généré automatiquement par le Système de Gestion.', 0, bottom, { align: 'center', lineBreak: false });
        });
        
        const bottom = doc.page.height - 30;
        doc.fillColor('#9CA3AF')
           .fontSize(8)
           .font('Helvetica')
           .text('Document généré automatiquement par le Système de Gestion.', 0, bottom, { align: 'center', lineBreak: false });

        doc.end();
        resolve();
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
}

module.exports = PdfService;
