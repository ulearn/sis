Issue 38 -- Unassigned Booking Courses (Addendum 7 Aug 2026, run l)

Reporter: Staff | Area: Holidays, Bookings | Sheet row: 40 | Check: 64th hourly -- Fri 7 Aug 2026 UTC

Symptom
Students with no class assignment will not appear in class lists when school resumes Monday 10 Aug.

Root Cause (64th check)
17 of 17 Booking Courses starting Mon 10 Aug still have 0 class assignments. Blockers risen from 1 to 4 since recipe 7aug-k.

Blockers (confirmed=false -- cannot assign until resolved)

BC96    Alessandro Signorotti  bk88    CONFIRMED  paid EUR 0       open EUR 250
BC25042 Edith Nunes            bk18262 PENDING    paid EUR 0       open EUR 456
BC833   Settiyanee Duangjai    bk790   ESCROW     paid EUR 4847.50 open null (in transit)
BC25007 Nominjin Amartsogt     bk18229 PARTIAL    paid EUR 980     open EUR 370

All 17 unassigned BCs

BC25004  Gen English AM Plus    Vincenzo Contu             bk18226  end 14 Aug  URGENT end Fri LAST CHANCE TODAY
BC25005  Gen English AM         Claudia Mereu              bk18227  end 14 Aug  URGENT end Fri LAST CHANCE TODAY
BC108    Intensive General 30   Lucia Borroni              bk98     end 21 Aug  ready
BC109    Morning General        Maicol Moretti             bk99     end 21 Aug  ready
BC25024  Gen English PM         Josimar Roberto            bk18246  end 21 Aug  ready
BC25039  Gen English PM Plus    Cristian Ravai             bk18259  end 28 Aug  ready
BC1313   AY Afternoon           Ana Luiza De Sousa         bk1286   end 28 Aug  ready (EUR 120 open, confirmed=true)
BC96     Intensive General 30   Alessandro Signorotti      bk88     end 28 Aug  BLOCKED
BC25042  Gen English AM         Edith Nunes                bk18262  end 28 Aug  BLOCKED
BC25036  Gen English AM         Jorge Perez Aldana         bk18256  end 4 Sep   ready
BC1818   AY Morning             Natanael Reis L de Sales   bk1631   end 18 Dec  ready
BC833    AY Morning             Settiyanee Duangjai        bk790    end 27 Nov  BLOCKED (ESCROW)
BC24915  AY Morning             Toshimi Hanakawa           bk18140  end 29 Jan  ready
BC24970  AY Afternoon           Tsengelbayar Mendsaikhan   bk18194  end 29 Jan  ready
BC25007  AY Morning             Nominjin Amartsogt         bk18229  end 12 Feb  BLOCKED
BC25027  AY Morning             Jacqueline Burgos          bk18248  end 12 Feb  ready
BC25031  AY Morning             Brisia Garcia Roman        bk18252  end 12 Feb  ready

Ready to assign: 13 | Blocked: 4

Fix Recipe (NOT YET RUN)

Step 1 -- TODAY Fri 7 Aug LAST CHANCE:
  SIS Admin > Classes > To Be Assigned
  Assign BC25004 (Vincenzo Contu, Gen English AM Plus) -- expires Fri 14 Aug
  Assign BC25005 (Claudia Mereu, Gen English AM) -- expires Fri 14 Aug

Step 2 -- Before Monday 10 Aug:
  Assign remaining 11 ready BCs: BC108, BC109, BC25024, BC25039, BC1313, BC25036, BC1818, BC24915, BC24970, BC25027, BC25031

Step 3 -- Resolve blockers:
  BC25042 (Edith Nunes, bk18262 PENDING): chase EUR 456 -- zero paid
  BC25007 (Nominjin Amartsogt, bk18229 PARTIAL): chase EUR 370 balance
  BC96 (Alessandro Signorotti, bk88): chase EUR 250 -- set confirmed=true once paid
  BC833 (Settiyanee Duangjai, bk790 ESCROW): monitor TransferMate release then confirm

Step 4 -- Verify:
  Check SIS Admin class lists for Mon 10 Aug -- all 13 ready students must appear.

Risk
Category: bookings / class assignment. Reversible: yes. Blast radius: 17 students start Mon with no class. BC25004+BC25005 miss entire 1-week course if not assigned today.

Status
Open -- NOT RUN. CRITICAL for Fri 7 Aug.
Last checked: Fri 7 Aug 2026 UTC (64th hourly run)