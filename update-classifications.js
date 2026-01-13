const rawData = `400.3.2 Pendidikan Anak Usia Dini (PAUD) Nonformal, Informal 
400.3.2.1 Bahan Ajar (Alat Permainan Edukatif) 
400.3.2.2 Pelatihan Sosial 
400.3.2.3 Peringatan Hari anak 
400.3.2.4 Block Grant 

400.3.3 Pendidikan Masyarakat 
400.3.3.1 Penyelenggaraan Program 
400.3.3.2 Penilaian dan pemberian bantuan sosial 
400.3.3.3 Pembinaan Program 
400.3.3.4 Lomba/Pemberian Penghargaan 
400.3.3.5 Pameran 
400.3.3.6 Rakor 
400.3.3.7 Sosialisasi 
400.3.3.8 Sertifikasi dan Akreditasi 

400.3.4 Kursus/Pelatihan Pendidik dan Tenaga Pendidik 

400.3.5 Pendidikan Dasar dan Menengah Pertama 
400.3.5.1 Kurikulum, bahan ajar 
400.3.5.2 Block Grant 
400.3.5.3 Pelatihan, Bimtek, sosialisasi, 
400.3.5.4 Lomba, penghargaan, penganugerahan 
400.3.5.5 Bantuan operasional sekolah (BOS) 
400.3.5.6 Bantuan Siswa Miskin 

400.3.6 Pendidikan khusus/Layanan Khusus 
400.3.6.1 Kurikulum, Bahan ajar, alat bantu pembelajaran 
400.3.6.2 Block Grant 
400.3.6.3 Lomba, festival 
400.3.6.4 Sosialisasi, bimtek 
400.3.6.5 Pendataan 
400.3.6.6 Kelembagaan 

400.3.7 Pembinaan Pendidik dan Tenaga Pendidik 
400.3.7.1 Pendataan dan Pemeetaan 
400.3.7.2 Uji Kompetensi Guru 
400.3.7.3 Sertifikasi Guru 
400.3.7.4 Penghargaan guru dan tenaga kependidikan 
400.3.7.5 Peningkatan kesejahteraan guru 
400.3.7.6 Sosialisasi, bimtek 
400.3.7.7 Block Grant 

400.3.8 Sekolah Menengah Atas 
400.3.8.1 Kurikulum 
400.3.8.2 Bahan Ajar 
400.3.8.3 Pelatihan 
400.3.8.4 Block grant 
400.3.8.5 Bimbingan teknis/sosialisasi 
400.3.8.6 Lomba, Sayembara, festival 
400.3.8.7 Bantuan operasional Sekolah (BOS) 
400.3.8.8 Bantuan siswa miskin 

400.3.9 Pendidikan Khusus-Layanan Khusus 
400.3.9.1 Bahan ajar 
400.3.9.2 Petunjuk Teknis 
400.3.9.3 Block grant 
400.3.9.4 Sosialisasi, bimtek 
400.3.9.5 Lomba, sayembara, jambore, festival 
400.3.9.6 Kurikulum/bahan pembelajaran 
400.3.9.7 Alat bantu pembelajaran 
400.3.9.8 Pendataan 
400.3.9.9 Kelembagaan (Unit kesehatan sekolah, Pendidikan jasmani adaptif, pendidikan inklusi 

400.3.10 Pendidik dan Tenaga Pendidik 
400.3.10.1 Pendataan dan Pemetaan 
400.3.10.2 Uji Kompetensi Guru 
400.3.10.3 Setifikasi Guru 
400.3.10.4 Penilaian prestasi kerja guru dan pengawas sekolah 
400.3.10.5 Penghargaan guru dan tenaga kependidikan 
400.3.10.6 Peningkatan kesejahteraan guru dan tenaga pendidik 
400.3.10.7 Block grant 
400.3.10.8 Bimbingan teknis/sosialisasi 

400.3.11 Penilaian Pendidikan 
400.3.11.1 Penilaian Akademik 
400.3.11.2 Penilaian Non Akademik 
400.3.11.3 Analisis dan Sistem Informasi Penilaian 

400.3.12 Data dan Statistik Pendidikan 
400.3.12.1 Data peserta didik, pendidik dan tenaga kependidikan 
400.3.12.2 Data Satuan Pendidikan dan Proses Pembelajaran
 
400.3.13 Prasarana dan Sarana Pendidikan 
400.3.13.1 Prasarana Pendidikan 
400.3.13.2 Sarana Pendidikan 
400.3.13.3 Monitoring dan Evaluasi`;

async function run() {
    try {
        // 1. Parse new data
        const newCodes = rawData.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const parts = line.split(' ');
                const code = parts[0];
                const label = parts.slice(1).join(' ');

                // Determine type based on segments (3 segments = main, 4 segments = sub)
                // e.g. 400.3.2 (3) -> main, 400.3.2.1 (4) -> sub
                const segments = code.split('.').length;
                const type = segments === 3 ? 'main' : 'sub';

                return { code, label, type };
            });

        console.log(`Parsed ${newCodes.length} new codes.`);

        // 2. Fetch current data
        console.log("Fetching current codes...");
        const res = await fetch('http://localhost:3000/api/classifications');
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const currentCodes = await res.json();
        console.log(`Fetched ${currentCodes.length} existing codes.`);

        // 3. Merge
        // We want to remove any existing codes that start with 400.3.2 up to 400.3.13
        // Actually, we should be careful. 
        // Let's filter out any code that starts with "400.3." followed by 2,3,4...13
        // Regex: ^400\.3\.(2|3|4|5|6|7|8|9|10|11|12|13)(\.|$)

        const regex = /^400\.3\.(2|3|4|5|6|7|8|9|10|11|12|13)(\.|$)/;

        const keptCodes = currentCodes.filter(c => !regex.test(c.code));
        console.log(`Kept ${keptCodes.length} codes after filtering.`);

        const finalCodes = [...keptCodes, ...newCodes];

        // 4. Sort
        // Ensure all codes are strings
        finalCodes.forEach(c => c.code = String(c.code));

        finalCodes.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

        console.log(`Total codes to save: ${finalCodes.length}`);

        // 5. Save
        console.log("Saving to server...");
        const saveRes = await fetch('http://localhost:3000/api/classifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalCodes)
        });

        if (!saveRes.ok) throw new Error(`Failed to save: ${saveRes.statusText}`);

        const result = await saveRes.json();
        console.log("Save successful:", result);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
