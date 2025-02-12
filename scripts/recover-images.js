const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  process.exit(1);
}

async function recoverImages() {
  try {
    console.log('Starting recovery process for user:', userId);
    
    const response = await fetch('http://localhost:3000/api/recover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Recovery failed');
    }

    console.log('Recovery completed:', data.results);
    console.log(`- Processed: ${data.results.processed}`);
    console.log(`- Recovered: ${data.results.recovered}`);
    console.log(`- Skipped: ${data.results.skipped}`);
    console.log(`- Errors: ${data.results.errors}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

recoverImages();
