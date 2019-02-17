function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ConfigRepository = {
  get: async () => {
    await sleep(10);
    return {
      'parties': [
        'PKB',
        'Gerindra',
        'PDIP',
        'Golkar',
        'NasDem',
        'Partai Garuda',
        'Partai Berkarya',
        'PKS',
        'Perindo',
        'PPP',
        'PSI',
        'PAN',
        'Hanura',
        'Partai Demokrat',
        'Partai Aceh',
        'Partai Sira (Aceh)',
        'Partai Daerah Aceh',
        'Partai Nanggroe Aceh',
        'Partai Bulan Bintang (PBB)',
        'Partai Keadilan dan Persatuan Indonesia (PKPI)',
      ],
      'num_ranks': 12,
      'total_ranks': 0
    }
  }
};
