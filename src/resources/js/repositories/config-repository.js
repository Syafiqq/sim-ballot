function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ConfigRepository = {
  get: async () => {
    await sleep(2000);
    return {
      'parties': [
        'MANGGA',
        'MANGGIS',
        'MELON',
        'KELENGKENG',
        'NANAS',
        'JAMBU',
        'RAMBUTAN',
        'SALAK',
        'PEPAYA',
        'BELIMBING',
        'KESEMEK',
        'DUKU'
      ],
      'num_ranks': 12,
      'total_ranks': 12
    }
  }
};
