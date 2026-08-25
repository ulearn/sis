❯ The guy that I picked out he's actually already reconciled with an escrow to reconcile is the wrong word he has an escrow entry
  payment already so it's actually taken care of just in terms of the end to end and I'm just going to brain dump this here for a minute
  yes you're correct thinking the basic transformation API and you know catches funds in escrow that's known as pending in their
  language and if it stays in pending I think for more than two days like then you can sort of say that it's an escrow or you could use
  another data point which is quote unquote exotic countries and anyone that's in pending from an exotic country you will know that they
  are in escrow and the reason that's important is because the pending state as far as I know they only have one state pending can also
  refer to a settlement layer so for example if somebody from Brazil or Argentina that is not requiring of escrow services because they
  don't need a visa before they dip art they their payments will also be pending for a short period of time maybe 24 hours could be 48
  hours could be 72 hours before it settles into the bank you know kind of landside so in in Ireland or transfer mate resides and at
  that point there pending status will then be confirmed or whatever changes status OK and then I think it eventually changes to paid or
  pay out or something like that but when they're in the air right at that pending status the ones who are not escrow and the ones that
  are escrow are actually confusingly they have the same flag I know it's ******* stupid but that's I think that's what happens because
  that's what fidelo told me so the only way around that would be to kind of go "OK they have the pending flag and they're also from
  China or one of our defined visa before departure countries right we have a list of territories it's we use it all the time so it's
  not a big deal we have a source of truth on that I am on the combination of those two data points we will just immediately flag them
  as escrow until proven otherwise right and then if they come out of that if they come out of pending obviously that's a state change
  and our API will flag that at some point in time I I'm not sure that we need to do polling on it I think that they send out like they
  they send out pings so it's not that we need to do a midnight as far as I know at midnight Cron or anything like that and they do
  actually fire out things on state changes which will trigger our systems to move forward so should be pretty straightforward AM
  
   The other part of it would be HubSpot on it the treatment of escrow in hotspot so you know up to now we've just kind of left these
  escrow guys we leave them at the contract stage which is just before the one stage so we don't call them one because they're still in
  escrow right now that's out of kilter with the new approach which is the correct approach an so we used to split up the deals based on
  like how much money we got so if somebody paid a deposit of 250 we would push that through to 1 and then we would retain the the you
  know other 750 if it was $1000 deal and we would we would keep the 7:50 in a contract stage until they paid and then we'd push that
  into one like that's kind of a work around OK so now we have like the deal is the commercial decision point and even if they paid
  $1.00 we move the whole deal into one and it has a balance outstanding on it so the kind of the cash element is taken care of by
  accounts receivable and I think that that is the correct way to do it so you still have like the you know you still have the number of
  deals if you want that ordinal but the actual figure of cash is a separate element that we now run different reports on so it would
  actually be more in keeping with that new system to move these these escrow deals into one right and the reason for that would be is
  it because we have a non refundable €250 charge on the non EU visas plus we keep their regia 50 so effectively even if they get
  refused we're getting €300 you know what I mean so I think removing the thing into one now we're not going to say and we're not going
  to indicate any amount on the deal there would be no payment attached to it at all obviously 'cause there's no payments coming in from
  zero from the bank or whatever'cause nothing is settled in the bank later but we will move it to 1 with the full balance outstanding
  and we will put some other type of flag on that deal to say escrow OK and I think that's what we're gonna do so the that's going to be
  another what would you call it downstream trigger from the API code that we're gonna set up now on the hub server so this kind of two
  things happening at the same time on those escrow pings like the notification I just sent you a minute ago is an e-mail presumably
  that comes from their internal offices but it comes from their API as date change and that's what fires those automated emails to us
  so we will be doing a similar thing will be taking that same ping and we'll be doing two things number one signing the escrow payment
  here in the SIS I'm sorry number one in the HubSpot we're gonna do that thing with the deal I just told you so it'll do some at
  changes downstream on the deal it will move it to 1 and allowed that flag of escrows somewhere I'm not sure where maybe I don't know
  we'll stick it somewhere that's easy to see with the full balance outstanding and then in the SIS we will just add the payment exactly
  as we have done for booking 1612 AM and then if the person is rejected we're just gonna hold on to the 350 now at that point we will
  assign that payment when it's paid back into our account we will assign that payment to that deal now weirdly I think we might then
  move the deal to LOST which is a weird outcome for a financial gain but I think it  is correct because wwe have GoogleAds metrics tied
  to these outcomes and we signal lots of "WON" Deals for refusals we're actuallyl signalling the wrong thing to google