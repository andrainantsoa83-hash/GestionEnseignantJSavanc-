const db = require('../config/db');

class Stats {
  static async getStatsByType(type, id) {
    const columnMap = {
      'cisco': 'id_cisco',
      'commune': 'id_commune',
      'zap': 'id_zap',
      'etablissement': 'id_etablissement'
    };

    const columnName = columnMap[type.toLowerCase()];
    if (!columnName) {
      throw new Error("Type invalide");
    }

    const query = `
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS fonctionnaire,
        SUM(CASE WHEN LOWER(statut) LIKE '%contractuel%' THEN 1 ELSE 0 END) AS contractuel,
        SUM(CASE WHEN LOWER(statut) LIKE '%fram sub%' OR LOWER(statut) LIKE '%fram_sub%' THEN 1 ELSE 0 END) AS fram_sub,
        SUM(CASE WHEN LOWER(statut) LIKE '%fram non sub%' OR LOWER(statut) LIKE '%fram_non_sub%' THEN 1 ELSE 0 END) AS fram_non_sub,
        SUM(CASE WHEN LOWER(statut) LIKE '%autre%' THEN 1 ELSE 0 END) AS autres,
        COUNT(*) AS totalGeneral
      FROM enseignants
      WHERE ${columnName} = ?
    `;

    const [rows] = await db.query(query, [id]);
    const result = rows[0];

    const fonctionnaire = Number(result.fonctionnaire) || 0;
    const contractuel = Number(result.contractuel) || 0;
    const fram_sub = Number(result.fram_sub) || 0;
    const fram_non_sub = Number(result.fram_non_sub) || 0;
    const autres = Number(result.autres) || 0;
    const total = Number(result.totalGeneral) || 0;

    const totalAutresStatuts = fram_sub + fram_non_sub + contractuel + autres;
    const besoin_recrutement = fonctionnaire - totalAutresStatuts;

    // Construit l'objet de retour dynamique (ex: cisco_id: 1 ou commune_id: 5)
    const returnObj = {
      [`${type.toLowerCase()}_id`]: parseInt(id, 10),
      fonctionnaire,
      contractuel,
      fram_sub,
      fram_non_sub,
      autres,
      total,
      besoin_recrutement
    };

    return returnObj;
  }

  static async getCiscoCommuneStats(ciscoId) {
    // 1. Récupérer le nom du Cisco
    const [ciscoRows] = await db.query('SELECT nom FROM ciscos WHERE id = ?', [ciscoId]);
    if (ciscoRows.length === 0) {
      throw new Error("Cisco introuvable");
    }
    const ciscoName = ciscoRows[0].nom;

    // 2. Récupérer les stats groupées par commune avec JOIN pour avoir le nom de la commune
    const query = `
      SELECT 
        c.nom AS nom_commune,
        SUM(CASE WHEN LOWER(e.statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS fonctionnaire,
        SUM(CASE WHEN LOWER(e.statut) LIKE '%contractuel%' THEN 1 ELSE 0 END) AS contractuel,
        SUM(CASE WHEN LOWER(e.statut) LIKE '%fram sub%' OR LOWER(e.statut) LIKE '%fram_sub%' THEN 1 ELSE 0 END) AS fram_sub,
        SUM(CASE WHEN LOWER(e.statut) LIKE '%fram non sub%' OR LOWER(e.statut) LIKE '%fram_non_sub%' THEN 1 ELSE 0 END) AS fram_non_sub,
        SUM(CASE WHEN LOWER(e.statut) LIKE '%autre%' THEN 1 ELSE 0 END) AS autres,
        COUNT(e.id) AS totalGeneral
      FROM communes c
      LEFT JOIN enseignants e ON c.id = e.id_commune
      WHERE c.id_cisco = ?
      GROUP BY c.id, c.nom
      ORDER BY c.nom ASC
    `;

    const [rows] = await db.query(query, [ciscoId]);

    const communes = rows.map(row => {
      const fonctionnaire = Number(row.fonctionnaire) || 0;
      const contractuel = Number(row.contractuel) || 0;
      const fram_sub = Number(row.fram_sub) || 0;
      const fram_non_sub = Number(row.fram_non_sub) || 0;
      const autres = Number(row.autres) || 0;
      const total = Number(row.totalGeneral) || 0;

      const totalAutresStatuts = fram_sub + fram_non_sub + contractuel + autres;
      const besoin_recrutement = fonctionnaire - totalAutresStatuts;

      return {
        nom_commune: row.nom_commune,
        fonctionnaire,
        contractuel,
        fram_sub,
        fram_non_sub,
        autres,
        total,
        besoin_recrutement
      };
    });

    return {
      cisco: ciscoName,
      communes
    };
  }
  static async getGlobalDashboardStats() {
    // Totals
    const [[ciscoCount]] = await db.query('SELECT COUNT(*) as count FROM ciscos');
    const [[communeCount]] = await db.query('SELECT COUNT(*) as count FROM communes');
    const [[zapCount]] = await db.query('SELECT COUNT(*) as count FROM zaps');
    const [[etablissementCount]] = await db.query('SELECT COUNT(*) as count FROM etablissements');
    
    // Enseignants statuts & total
    const [enseignantsStats] = await db.query(`
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS fonctionnaire,
        SUM(CASE WHEN LOWER(statut) LIKE '%contractuel%' THEN 1 ELSE 0 END) AS contractuel,
        SUM(CASE WHEN LOWER(statut) LIKE '%fram sub%' OR LOWER(statut) LIKE '%fram_sub%' THEN 1 ELSE 0 END) AS fram_sub,
        SUM(CASE WHEN LOWER(statut) LIKE '%fram non sub%' OR LOWER(statut) LIKE '%fram_non_sub%' THEN 1 ELSE 0 END) AS fram_non_sub,
        SUM(CASE WHEN LOWER(statut) LIKE '%autre%' THEN 1 ELSE 0 END) AS autres,
        COUNT(*) AS total
      FROM enseignants
    `);
    
    const stats = enseignantsStats[0];
    const fonctionnaire = Number(stats.fonctionnaire) || 0;
    const contractuel = Number(stats.contractuel) || 0;
    const fram_sub = Number(stats.fram_sub) || 0;
    const fram_non_sub = Number(stats.fram_non_sub) || 0;
    const autres = Number(stats.autres) || 0;
    const totalEnseignants = Number(stats.total) || 0;

    const totalAutresStatuts = fram_sub + fram_non_sub + contractuel + autres;
    const besoinRecrutement = fonctionnaire - totalAutresStatuts;

    // Repartition par CISCO
    const [zoneData] = await db.query(`
      SELECT c.nom as name, COUNT(e.id) as enseignants 
      FROM ciscos c
      LEFT JOIN enseignants e ON c.id = e.id_cisco
      GROUP BY c.id, c.nom
    `);

    return {
      stats: {
        cisco: ciscoCount.count,
        communes: communeCount.count,
        zap: zapCount.count,
        etablissements: etablissementCount.count,
        enseignants: totalEnseignants,
        besoinRecrutement
      },
      statutData: [
        { name: 'Fonctionnaires', value: fonctionnaire, color: '#1e293b' },
        { name: 'Contractuels', value: contractuel, color: '#38bdf8' },
        { name: 'FRAM sub.', value: fram_sub, color: '#ef4444' },
        { name: 'FRAM non sub.', value: fram_non_sub, color: '#ffffff' },
        { name: 'Autres', value: autres, color: '#1e293b' },
      ],
      zoneData
    };
  }
}

module.exports = Stats;
