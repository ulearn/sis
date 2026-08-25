Issue 6 - Erroneous Mobile Numbers (341st run)
Row: 7  Run: 341st Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB)
- Total students: 14,472 (unchanged from previous check)
- 552 students: phoneMobile does not start with +
- 419 students: phoneMobile starts with + but contains spaces or dashes
- Total non-E.164: 971 (unchanged)
- Day 43 since issue filed -- fix not applied

FIX (NOT YET RUN):
  // Normalise + phones with spaces/dashes (~419 records):
  const all=await p.student.findMany({where:{phoneMobile:{startsWith:"+",not:null}},select:{id:true,phoneMobile:true}});
  const toFix=all.filter(s=>/[s-]/.test(s.phoneMobile));
  for(const s of toFix){ await p.student.update({where:{id:s.id},data:{phoneMobile:s.phoneMobile.replace(/[s-]/g,"")}}); }
  // 552 without + need manual country-code review

RISK: data-hygiene -- reversible. Blast: ~971 students.
See also: issue-6-addendum-17aug.md (from 04:11 UTC today)
Last checked: 2026-08-17 (341st hourly run)