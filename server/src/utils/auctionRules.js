// IPL Auction Rules & Validation Utilities

export function getNextBidIncrement(currentBid) {
  if (currentBid < 1.0) {
    return 0.10; // 10 Lakhs
  } else if (currentBid < 2.0) {
    return 0.20; // 20 Lakhs
  } else if (currentBid < 5.0) {
    return 0.25; // 25 Lakhs
  } else {
    return 0.50; // 50 Lakhs
  }
}

export function getNextBidAmount(currentBid, basePrice) {
  if (!currentBid || currentBid === 0) {
    return basePrice;
  }
  const inc = getNextBidIncrement(currentBid);
  return Number((currentBid + inc).toFixed(2));
}

export function validateBid(team, player, bidAmount) {
  // 1. Max Squad Size (25)
  if (team.players.length >= 25) {
    return { valid: false, reason: `${team.shortName} has reached the maximum squad limit of 25 players.` };
  }

  // 2. Overseas Player Limit (Max 8)
  if (player.isOverseas) {
    const overseasCount = team.players.filter(p => p.isOverseas).length;
    if (overseasCount >= 8) {
      return { valid: false, reason: `${team.shortName} has reached the maximum limit of 8 overseas players.` };
    }
  }

  // 3. Sufficient Purse
  if (team.purseRemaining < bidAmount) {
    return {
      valid: false,
      reason: `Insufficient purse! ${team.shortName} has ₹${team.purseRemaining.toFixed(2)} Cr remaining, needs ₹${bidAmount.toFixed(2)} Cr.`
    };
  }

  // 4. Minimum Squad Reserve Rule (Must be able to reach at least 18 players with 0.30 Cr uncapped reserve per needed slot)
  const currentTotal = team.players.length + 1; // including this candidate
  const minSlotsNeeded = Math.max(0, 18 - currentTotal);
  const minReserveRequired = minSlotsNeeded * 0.30;
  const remainingAfterBid = team.purseRemaining - bidAmount;

  if (remainingAfterBid < minReserveRequired) {
    return {
      valid: false,
      reason: `Purse reserve violation: Must keep at least ₹${minReserveRequired.toFixed(2)} Cr reserve to reach minimum 18 players.`
    };
  }

  return { valid: true };
}

