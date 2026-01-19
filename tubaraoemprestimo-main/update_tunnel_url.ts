import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cwhiujeragsethyxjekkb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aGl1amVyYWdzZXRoeXhqZWtrYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMzMjQ1NTM3LCJleHAiOjIwNDg4MjE1Mzd9.jA8IrpCMG1dKwPHloZLJfOjqRH5W9xGUtlCGzRKdXvI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateEvolutionUrl() {
    const NEW_URL = 'https://antiques-entrepreneur-warrior-blues.trycloudflare.com';

    console.log('Updating Evolution API URL to:', NEW_URL);

    const { data, error } = await supabase
        .from('whatsapp_config')
        .update({ api_url: NEW_URL, updated_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
        console.error('Error updating:', error);
    } else {
        console.log('Success! URL updated to:', NEW_URL);
    }
}

updateEvolutionUrl();
