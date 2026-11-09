# IPL Auction Room --- Project Specification for Google Antigravity

> \*\*Purpose:\*\* Build a multiplayer IPL-style auction website in which
> one person creates a room, shares an invite link, and exactly 10
> participants each claim one different IPL team. The room then runs
> through trading, retention, purse calculation, and an automated player
> auction with RTM.

This document is the product specification and implementation checklist.
Give it to Antigravity as the main project brief. Build the application
in small, testable stages rather than generating the entire system in
one pass.

\---

## 1\. Product overview

Build a responsive web application for a private, room-based IPL auction
game.

There are **10 IPL teams and a maximum of 10 participants in each
room**. Each participant controls exactly one team. The room creator is
the first participant and also selects a team. The first person to claim
a team gets that team; later participants can choose only from the teams
that remain unclaimed.

Once all 10 teams have been claimed, the room is full and the auction
workflow can begin. An 11th person must never be allowed to join that
room.

### Main experience

1. A user creates a room.
2. The server creates a unique room ID and shareable invite URL.
3. The creator enters the room and selects any one of the 10 available
teams.
4. Other people open the invite URL and join the same room.
5. Each joining person selects one of the teams that are still
available.
6. The first-come-first-served team claim is enforced by the
server/database, not just by the browser.
7. When all 10 teams are claimed, the room has 10 participants and no
more people can enter.
8. The room starts with the actual 2026 squad assigned to each IPL
team.
9. Teams complete the 5-minute trading window.
10. Teams submit their retention/release decisions.
11. The system calculates each team's remaining purse.
12. The auction pool is created from released players plus eligible new
players from the 2026 auction player list.
13. An automated bidding engine runs the auction and handles eligible
RTM decisions.
14. The room displays the final squads, purchases, purse balances, and
auction history.

\---

## 2\. Important product rules

These are core requirements, not optional UI suggestions.

### Room and team-selection rules

* There are exactly 10 teams in a room.
* There can be at most 10 participants in a room.
* One participant controls one team only.
* One team can be claimed by one participant only.
* The room creator is a participant and must choose a team like
everyone else.
* The first participant to claim a team may choose any of the 10
teams.
* The second participant may choose any of the remaining 9 teams.
* The third participant may choose any of the remaining 8 teams, and
so on.
* The tenth participant gets the one remaining team.
* Once claimed, a team is unavailable to all other participants in
that room.
* A participant cannot change teams after claiming one, unless the
room owner explicitly resets the room before the auction begins.
* A room with 10 claimed teams is full.
* A full room rejects any new participant, even if the URL is valid.
* A room must also reject joins after it has started or closed, unless
a future spectator feature is deliberately added. Spectators are not
part of the first version.
* Do not allow duplicate participants caused by double-clicks,
refreshes, or multiple tabs. Use authenticated identity or a secure
participant session token.

### First-come-first-served must be real

Do not implement team claiming only in frontend JavaScript. Two people
may click the same team at almost the same time.

The backend must perform an atomic claim: 1. Verify that the room is in
`LOBBY` state. 2. Verify that the participant is a member of that room
and has not already claimed a team. 3. Verify that fewer than 10
participants have claimed teams. 4. Verify that the requested team is
not already claimed in that room. 5. Claim the team in a database
transaction with a unique constraint on `(room\_id, team\_id)`. 6. If
another participant wins the race, return a clear `TEAM\_ALREADY\_TAKEN`
response and refresh the available-team list.

The server/database is the source of truth. Never trust a client-side
team availability list.

\---

## 3\. IPL teams

Use these 10 teams as the canonical team records:

Team ID   Team

\---

CSK       Chennai Super Kings
MI        Mumbai Indians
RCB       Royal Challengers Bengaluru
KKR       Kolkata Knight Riders
SRH       Sunrisers Hyderabad
RR        Rajasthan Royals
DC        Delhi Capitals
PBKS      Punjab Kings
GT        Gujarat Titans
LSG       Lucknow Super Giants

Store stable team IDs separately from display names and logos. Do not
use team names as database primary keys.

\---

## 4\. Player data and 2026 starting squads

### Starting data

The starting point must be the **2026 squad for each of the 10 teams**.
Each team must begin the room with its own 2026 players.

Do not start with the 2025 squads, and do not mix 2025 player lists into
the 2026 starting rosters.

Create/import a verified data file with at least:

* Player ID (stable internal ID)
* Player name
* Nationality
* Overseas status (boolean)
* Main role: Batter, WK-Batter, All-rounder, or Bowler
* Optional secondary role
* Starting 2026 team ID
* 2026 contracted/auction price, if available and relevant to the
selected purse rules
* Data source and verification note

### New-player source

The new-player portion of the auction pool must come from the **2026 IPL
auction player list**.

The auction pool must include: 1. Players released by teams during this
website's retention stage. 2. Eligible players from the 2026 auction
player list who are not already present in any of the 10 starting 2026
squads.

Do not add a new-player-list entry if that player is already in a
starting squad. Compare by stable player ID where possible; otherwise
use carefully normalized names and manually review possible duplicates.

A player must never appear twice in the auction pool.

### Data integrity

* Use verified data. Do not invent squad members, roles, nationality,
prices, or auction-list entries.
* Keep the player data in seed files or database import scripts, not
hardcoded throughout UI components.
* Include a data validation script that reports duplicate players,
unknown team IDs, missing roles, and invalid overseas flags.
* If a source list is incomplete or uncertain, flag the record for
admin review rather than silently guessing.
* Preserve the source and last-updated date for each imported dataset.

### Player ownership

At any moment, a player can belong to: - One team in a room, or - The
auction pool, or - An unsold/available state.

A player cannot belong to two teams at once. A trade or auction purchase
must update ownership in a single database transaction.

\---

## 5\. Room creation and joining

### Create room

Provide a **Create Room** button on the landing page.

When clicked: - Create a room with a random, hard-to-guess room ID. -
Create a shareable URL, for example `/room/7KQ4PX`. - Set the room
status to `LOBBY`. - Set `max\_participants = 10`. - Add the creator as
participant number 1. - Show the room invite link and a copy-link
button. - The creator must then select one of the 10 available teams.

The room code should be unique and should not expose sequential database
IDs.

### Join room

When someone opens the invite URL: - Check that the room exists. - Check
that it is still in `LOBBY`. - Check that it has fewer than 10
participants. - Check whether the current user/session is already a
participant. - If eligible, add them to the room and show the available
teams. - Let them select one unclaimed team. - Update all other
participants' screens in real time.

If the room is full, show a clear message such as:

> This room is full. All 10 teams have already been selected.

If the room has started, show:

> This room has already started and is no longer accepting participants.

If the room code is invalid, show a room-not-found page.

### Room lobby screen

Display: - Room code and shareable invite link - Copy invite link
action - 10 team cards - Claimed/unclaimed status for every team -
Participant name and selected team for claimed slots - Number of
participants, e.g. `6 / 10` - Live updates when someone joins or claims
a team - Start-state indicator: `Waiting for all 10 teams`

Do not let the room proceed to trading until all 10 participants have
claimed one team, unless the room owner uses a clearly labelled
development/testing override. The production default is to require all
10.

### Reconnect and refresh

A participant who refreshes or returns using the same authenticated
account/session must recover their existing room membership and team. Do
not create a second participant record for them.

\---

## 6\. Suggested technology

Use this stack unless the existing project already has a working
equivalent:

* **Frontend:** Next.js with TypeScript
* **UI:** Tailwind CSS and a consistent component library
* **Backend/database:** Supabase (PostgreSQL)
* **Realtime updates:** Supabase Realtime or server-sent
events/WebSockets
* **Authentication:** Supabase Auth, or a secure guest-session system
with signed tokens
* **Hosting:** Vercel for the web application and Supabase for backend
services

Keep all privileged actions on the server. Never put database
service-role keys or secret API keys in browser code.

If Antigravity detects an existing stack, inspect it first and adapt the
design instead of replacing working code without reason.

\---

## 7\. Database design

Create a normalized relational schema. Suggested tables:

### `teams`

* `id` (CSK, MI, RCB, etc.)
* `name`
* `short\_name`
* `logo\_url` (optional)

### `players`

* `id`
* `name`
* `nationality`
* `is\_overseas`
* `primary\_role`
* `secondary\_role` (nullable)
* `source\_label`
* `source\_updated\_at`

### `player\_season\_records`

* `id`
* `player\_id`
* `season`
* `team\_id` (nullable)
* `status` (e.g. squad, auction-listed, released)
* `price` (nullable)
* `source\_note`

### `rooms`

* `id`
* `room\_code` (unique)
* `created\_by`
* `status`
* `max\_participants` (10)
* `created\_at`
* `started\_at` (nullable)
* `settings` (JSON for configurable auction settings)

### `room\_participants`

* `id`
* `room\_id`
* `user\_id` or secure participant session ID
* `display\_name`
* `join\_order`
* `team\_id` (nullable until selected)
* `joined\_at`
* Unique constraint on `(room\_id, user\_id/session\_id)`
* Unique constraint on `(room\_id, team\_id)` for non-null team IDs

### `room\_players`

A room-specific copy/state record for every player: - `id` - `room\_id` -
`player\_id` - `current\_team\_id` (nullable) - `player\_state` (`SQUAD`,
`RELEASED`, `AUCTION\_POOL`, `SOLD`, `UNSOLD`) - `acquisition\_type`
(`STARTING\_2026\_SQUAD`, `TRADE`, `RETENTION`, `AUCTION`, etc.) - `price`
(nullable) - Unique constraint on `(room\_id, player\_id)`

### `trades`

* `id`
* `room\_id`
* `from\_team\_id`
* `to\_team\_id`
* `offered\_player\_ids`
* `requested\_player\_ids`
* `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `EXPIRED`)
* `created\_at`
* `resolved\_at`

### `retentions`

* `id`
* `room\_id`
* `team\_id`
* `submitted`
* `submitted\_at`

### `retention\_players`

* `id`
* `retention\_id`
* `player\_id`
* `decision` (`RETAIN`, `RELEASE`)

### `team\_purses`

* `id`
* `room\_id`
* `team\_id`
* `starting\_purse`
* `retention\_deductions`
* `trade\_adjustments`
* `spent`
* `remaining`
* `updated\_at`

### `auction\_players`

* `id`
* `room\_id`
* `player\_id`
* `auction\_order`
* `status` (`UPCOMING`, `LIVE`, `SOLD`, `UNSOLD`, `SKIPPED`)
* `base\_price`
* `current\_price`
* `winning\_team\_id` (nullable)

### `auction\_bids`

* `id`
* `room\_id`
* `auction\_player\_id`
* `team\_id`
* `bid\_amount`
* `bid\_source` (`AUTOMATED`, `RTM`)
* `created\_at`

### `rtm\_decisions`

* `id`
* `room\_id`
* `auction\_player\_id`
* `former\_team\_id`
* `eligible`
* `decision` (`USED`, `DECLINED`, `NOT\_ELIGIBLE`)
* `matched\_price`
* `decided\_at`

### `room\_events`

* `id`
* `room\_id`
* `event\_type`
* `actor\_id` (nullable for system events)
* `payload` (JSON)
* `created\_at`

Add indexes for room code, room status, room/team membership, player
state, and auction order. Use foreign keys and check constraints
wherever possible.

\---

## 8\. Room state machine

Use explicit room states. Do not rely on a collection of unrelated
booleans.

Suggested states:

``` text
LOBBY
  -> TRADING\_OPEN
  -> TRADING\_CLOSED
  -> RETENTION\_OPEN
  -> RETENTION\_LOCKED
  -> PURSE\_CALCULATED
  -> AUCTION\_POOL\_READY
  -> AUCTION\_LIVE
  -> AUCTION\_COMPLETED
```

Rules: - The room starts in `LOBBY`. - It can enter `TRADING\_OPEN` only
after 10 teams have been claimed. - Trading lasts exactly 5 minutes (300
seconds) according to server time. - The server closes trading
automatically at the deadline. - Retention opens only after trading
closes. - Retention locks only after all 10 teams submit, or the room
owner explicitly closes the stage under a documented rule. - Purse
calculation runs after retention is locked. - Auction pool generation
runs after purse calculation. - Auction starts only after the pool is
validated. - The auction ends when all auction-list players have been
processed or the admin ends it under an explicit override.

Store `phase\_started\_at` and `phase\_ends\_at` in the database. The
browser countdown is only a display; server time determines whether an
action is accepted.

\---

## 9\. Trading stage --- 5 minutes

### Requirements

* Trading opens for 300 seconds.
* Display a countdown to all participants.
* Teams can propose trades with other teams.
* A trade may involve one or more players on either side, according to
the room settings.
* The receiving team can accept or reject a proposal.
* A team cannot trade a player it does not currently own.
* A player cannot be included in two simultaneously accepted trades.
* A trade is valid only if both sides' roster and configured rules
remain valid after the trade.
* Ownership changes only after acceptance and successful server-side
validation.
* Every completed trade is logged in `room\_events` and `trades`.
* At the deadline, reject new proposals and stop accepting trade
decisions.
* Pending proposals should expire when the window closes.
* Show trade history and current squad lists.

### Transaction safety

When a trade is accepted, update both teams' player ownership
atomically. If any validation fails, roll back the entire trade.

\---

## 10\. Retention stage

After trading closes: - Each team sees its current squad. - Each team
marks each player as `RETAIN` or `RELEASE`. - Teams submit their
decisions. - A team can edit until it submits. - After submission, lock
that team's selection unless the room owner resets it before the stage
closes. - Show submission status to the room. - The retention
announcement can be configured as private until all teams submit, then
revealed together. This is the recommended default. - Retained players
remain with their teams and do not enter the auction pool. - Released
players leave their teams and enter the auction pool.

Validate squad limits and any configured retention restrictions before
accepting submission.

\---

## 11\. Purse calculation

Do not hardcode purse or retention rules throughout the application.

Create an admin-editable auction settings object containing: - Starting
purse per team - Whether retained players' existing contract/auction
prices are deducted - Any retention-specific deduction rules -
Trade-related purse adjustments, if applicable - Minimum bid increment -
Base-price rules - Squad size limits - Overseas-player limit - RTM rules

For a mini-auction-style setup, the retained players' applicable
existing costs generally need to carry forward; do not automatically
apply mega-auction retention slabs. The precise rules for this custom
room must be selected and displayed before the room begins.

Show each team: - Starting purse - Retention deductions - Trade
adjustments - Auction spending - Remaining purse

The purse calculation must run on the server and be reproducible from
the transaction history.

Never allow a bid or RTM match that would make a team's remaining purse
negative.

\---

## 12\. Auction-pool generation

Build the auction pool only after all retentions are locked and purse
balances are calculated.

Pool sources:

### A. Released players

Every player marked `RELEASE` enters the auction pool.

### B. New players from the 2026 auction list

Add players from the verified 2026 auction player list only if they are
not already present in any starting 2026 squad and are eligible under
the room's player rules.

### Exclusion rules

* Retained players must not enter the pool.
* Players currently owned by any team must not enter the pool.
* Duplicate player records must be merged or blocked.
* A player can appear only once in a room's auction pool.
* A player already sold in this room cannot be auctioned again unless
the room explicitly supports a later unsold/re-auction round.
* Record the source of every pool entry: `RELEASED\_PLAYER` or
`NEW\_2026\_AUCTION\_LIST\_PLAYER`.

Show a preview and validation summary before the auction begins.

\---

## 13\. Automated bidding engine

The auction bidder is controlled by code. Participants do not manually
click every bid.

Each team needs a configurable bidding profile. Suggested fields: -
Aggressiveness - Role priorities - Maximum valuation per player -
Maximum bid as a fraction of remaining purse - Overseas-player
priority - Preferred squad composition - Minimum purse reserve for
filling remaining squad slots - Whether the team is allowed to bid on a
given player

### Eligibility checks before every bid

The bidding engine must check: 1. The team has enough remaining purse
for the next bid. 2. The team has an open squad slot. 3. The
overseas-player limit will not be exceeded. 4. The player is not already
owned by that team or another team. 5. The team has not exceeded its
configured maximum valuation. 6. The bid increment is valid. 7. The team
can still afford to fill the remaining required squad slots at the
configured minimum price.

### Bidding loop

For each player: 1. Set the base price. 2. Determine all eligible teams.
3. Ask each eligible team's strategy whether it wants to bid. 4. Select
the next valid bid according to the configured auction order/turn logic.
5. Record every bid in `auction\_bids`. 6. Continue until no eligible
team is willing or able to raise. 7. Identify the highest valid bidder.
8. Run the RTM step if the player has an eligible former team. 9.
Finalize the sale or mark the player unsold. 10. Update ownership and
purse atomically. 11. Publish the result to all participants in real
time.

The auction engine must be deterministic for the same inputs and
strategy settings where practical. Log the reason a team did not bid, so
decisions can be debugged.

### Avoid fake bidding

Do not let the system place bids that are immediately invalid due to
purse, squad size, overseas limits, or player ownership. The server must
validate each bid even if the strategy engine has already checked it.

\---

## 14\. RTM (Right to Match)

Include RTM as a configurable auction feature.

At minimum: - Track the player's former team before release. - Determine
whether that former team is eligible for RTM under the selected room
rules. - After normal bidding identifies the highest bid, present the
RTM decision step. - In the fully automated version, the former team's
strategy decides whether to exercise RTM based on its valuation, purse,
squad space, overseas limit, and configured RTM rules. - If RTM is used,
apply the configured matching-price rule and transfer the player to the
former team. - If RTM is declined or unavailable, the highest bidder
wins. - Record every RTM decision and its price. - Do not allow RTM to
bypass purse or squad validation.

Because RTM price mechanics can depend on the auction format, make the
matching-price rule configurable rather than assuming one universal
rule. The room setup must show the RTM rule before the auction starts.

\---

\# IPL Auction Rules and Validation Engine



\## 1. Rule modes



The application must separate official IPL rules from custom game rules.



Provide two rule profiles:



\- `IPL\_2026\_MINI\_AUCTION`: Uses the applicable IPL 2026 mini-auction settings.

\- `CUSTOM\_RTM\_AUCTION`: Uses the IPL-style rules selected by the room creator, including optional RTM.



The room owner must see a summary of the active rules before the room begins. Once trading starts, settings that affect fairness must be locked.



Do not describe custom RTM behavior as an official IPL 2026 mini-auction rule.



\## 2. Teams and squad limits



Use the 10 IPL franchises:



\- Chennai Super Kings (CSK)

\- Mumbai Indians (MI)

\- Royal Challengers Bengaluru (RCB)

\- Kolkata Knight Riders (KKR)

\- Sunrisers Hyderabad (SRH)

\- Rajasthan Royals (RR)

\- Delhi Capitals (DC)

\- Punjab Kings (PBKS)

\- Gujarat Titans (GT)

\- Lucknow Super Giants (LSG)



For the IPL 2026-style squad rules, configure:



\- Minimum final squad size: 18 players.

\- Maximum final squad size: 25 players.

\- Maximum overseas players in a squad: 8.

\- Maximum participants per room: 10, one participant per team.



The minimum and maximum squad limits apply to the final team-building rules. During the custom retention process, the system must warn if a team's decisions would make it impossible to meet the minimum squad size after the auction.



Validate these limits after trades, retention, RTM, and every successful auction purchase.



\## 3. Purse and salary accounting



For an IPL 2026 mini-auction-style configuration:



\- Starting auction purse: ₹125 crore per team, subject to the selected rule profile.

\- Deduct the applicable cost of players already contracted to the team.

\- Apply any permitted adjustments from trades.

\- Subtract auction purchases from the remaining purse.

\- Never allow an ordinary bid or RTM match to make the purse negative.



Keep these values separate:



\- `starting\_purse`

\- `existing\_contract\_cost`

\- `retention\_deductions`

\- `trade\_adjustments`

\- `auction\_spent`

\- `remaining\_purse`



Do not deduct a player's salary twice. Existing 2026 squad players must be initialized with their correct contract cost, and every later transaction must update the purse exactly once.



For custom trades, make the financial treatment configurable. Do not assume that transferring a player automatically transfers their entire contract value unless the room's rules specify it.



The purse calculation must run on the server and be reproducible from the transaction log.



\## 4. Capped and uncapped player classification



Add these fields to the player database:



\- `player\_status`: `CAPPED`, `UNCAPPED`, or `UNKNOWN`

\- `is\_indian`

\- `is\_overseas`

\- `uncapped\_rule\_eligible`

\- `classification\_source`

\- `classification\_verified\_at`



\### Official uncapped definition for Indian players



Under the IPL regulations announced for the 2025–2027 cycle, a capped Indian player can qualify as uncapped if, during the five calendar years preceding the relevant season, they have not played in the starting XI of an international Test, ODI, or T20I, and do not have a BCCI central contract.



Implement this as a season-specific eligibility check. Do not infer uncapped status from age, domestic experience, IPL experience, or player reputation alone.



For overseas players, do not apply the special Indian-player definition. Use the official auction classification where available, or mark the classification `UNKNOWN` until verified.



The system must not silently assume that an unverified player is uncapped.



\### Validation



\- A player classified as uncapped must have a verified classification source.

\- If a retention limit depends on uncapped status and a player's status is unknown, block submission until the status is resolved or the room owner explicitly changes the applicable custom rule.

\- Recalculate eligibility for the relevant season rather than permanently treating a player as uncapped.

\- Display capped/uncapped status on player cards and retention screens.



\## 5. Retention rules



Retention must be governed by the selected rule profile.



\### IPL 2025 mega-auction reference rules



The 2025 mega-auction allowed a maximum of six players through retention and RTM combined, with:



\- No more than five capped players.

\- No more than two uncapped players.



These limits belong to the 2025 mega-auction profile. Do not automatically apply them to the IPL 2026 mini-auction profile.



\### Custom retention stage in this website



Because the game starts with the 2026 squads and then runs its own trade and retention stages, make these settings configurable:



\- Maximum players retained per team.

\- Maximum capped players retained.

\- Maximum uncapped players retained.

\- Whether retained players' existing costs are deducted.

\- Whether retention rules count RTM usage.

\- Whether every team must submit before retention is revealed.



The recommended default is to keep submissions private until all teams have submitted, then reveal them simultaneously.



Before accepting a retention submission, validate player ownership, player classification, configured retention limits, and the team's ability to form a legal final squad.



Retained players stay with their teams and must never enter the auction pool.



Released players enter the auction pool exactly once.



\## 6. RTM — Right to Match



RTM must be optional and configurable.



\### Official-format distinction



RTM was available under the IPL 2025 mega-auction rules but was not available in the IPL 2026 mini-auction. The website may implement RTM in `CUSTOM\_RTM\_AUCTION`, but must not label it as an official IPL 2026 mini-auction feature.



\### Custom RTM process



1\. A released player enters the auction.

2\. Automated bidding proceeds normally.

3\. The system identifies the highest valid bidder.

4\. The system checks whether the player's former team is eligible for RTM.

5\. The former team's automated strategy evaluates its valuation, purse, squad space, overseas limit, and remaining RTM allowance.

6\. If eligible, the strategy may exercise RTM or decline.

7\. Apply the configured RTM price-matching process.

8\. Finalize ownership and purse deductions in a single transaction.

9\. Record the RTM decision and final price in the audit log.



\### Optional 2025 mega-auction RTM price procedure



If the room explicitly selects the 2025 mega-auction RTM procedure:



\- The former team indicates that it wants to use RTM after the initial highest bid.

\- The highest-bidding team is given an opportunity to increase its bid once.

\- The former team then decides whether to match the revised final bid.

\- If the former team matches, it acquires the player at that price.

\- If it declines, the highest bidder acquires the player.



This procedure must be implemented only when that RTM rule is selected.



\### RTM validation



\- RTM can only be used by an eligible former team.

\- The player must be one for whom that team has an eligible RTM right.

\- The team must have sufficient remaining purse.

\- The team must have an available squad slot.

\- The overseas-player limit must not be exceeded.

\- The team must have remaining RTM allowance if the chosen rules impose one.

\- A player can be sold only once.

\- An RTM decision must not be processed twice after a refresh or repeated request.



For the custom auction, the room owner must select the RTM allowance, eligibility conditions, and matching-price procedure before trading starts.



\## 7. Overseas-player rules



Each player must have a verified `is\_overseas` boolean.



For IPL 2026-style squad construction:



\- A team may have at most eight overseas players in its final squad.

\- The auction pool may contain both Indian and overseas players.

\- Before an overseas player is sold to a team, check whether that team has an available overseas slot.

\- Reject a bid if buying that player would exceed the overseas limit.

\- Apply the same checks to RTM and any trade that would transfer a player.

\- Trading must not allow a team to exceed the overseas limit.



The room must distinguish the total number of overseas players from the number of overseas slots still available.



Do not confuse overseas status with capped/uncapped status.



\## 8. Trading rules



Trading runs for exactly 300 seconds.



\- A team may offer players it currently owns.

\- A trade requires the necessary approvals from both teams.

\- Player ownership must change atomically.

\- A player cannot be involved in conflicting completed trades.

\- Validate the resulting squad size and overseas-player limit.

\- Apply any configured contract-cost or purse adjustments.

\- Reject trades after the server-side deadline.

\- Expire unresolved proposals when trading closes.

\- Record every accepted, rejected, cancelled, or expired trade.



If a trade violates the active squad rules, reject it without changing ownership or purse.



\## 9. Auction pool eligibility



Generate the auction pool only after trading and retention are complete.



Include:



1\. Players released by teams in the retention stage.

2\. Eligible players from the verified IPL 2026 auction list who are not already in any starting 2026 squad and are otherwise eligible under the selected rules.



Exclude:



\- Retained players.

\- Players still owned by any team.

\- Duplicate player records.

\- Players already sold in the current room.

\- Ineligible players and records that require unresolved eligibility checks.



Use stable player IDs wherever possible. Normalize names only as a fallback and flag possible duplicates for review.



Each auction-pool record must include its source, such as `RELEASED\_PLAYER` or `NEW\_2026\_AUCTION\_LIST\_PLAYER`.



\## 10. Automated bidding rules



All bids are generated and validated by the server-side auction engine.



Each team's strategy must consider:



\- Remaining purse.

\- Player role and squad needs.

\- Current squad size.

\- Remaining squad slots.

\- Overseas-player limit.

\- Player capped/uncapped status where relevant.

\- Maximum valuation for the player.

\- Minimum reserve needed to fill remaining squad slots.

\- Auction base price and bid increment.

\- RTM eligibility and remaining RTM allowance.



Before accepting any bid, validate that:



\- The bid amount follows the configured increment.

\- The team can afford it.

\- The team has a legal squad slot available.

\- Overseas limits remain valid.

\- The player is still available.

\- The bid does not exceed the strategy's maximum valuation.



The server must determine the winner and update the purse and player ownership atomically.



\## 11. Auction order and unsold players



Keep auction ordering configurable.



The system may group players by categories such as batters, wicketkeepers, all-rounders, and bowlers, but must not claim that a custom ordering is the official 2026 auction order.



Support the following states:



`UPCOMING`, `LIVE`, `SOLD`, `UNSOLD`, `SKIPPED`.



If the room enables an unsold-player round, only eligible unsold players may return. Players already sold must not be auctioned again.



\## 12. Player availability and eligibility checks



For every player, validate:



\- The player has a unique ID.

\- The player is not owned by more than one team.

\- The player is not simultaneously in a team and the auction pool.

\- The player's role is known.

\- Overseas status is verified.

\- Capped/uncapped classification is verified when required by the active rules.

\- The player is eligible for the selected auction pool.

\- The player has not already been sold in the room.



Block critical actions when data needed to enforce a rule is missing.



\## 13. Server-side enforcement



All rule checks must be enforced on the backend and database, not only in the browser.



Use database transactions for:



\- Team selection.

\- Trade acceptance.

\- Retention locking.

\- Purse calculation.

\- Auction sale finalization.

\- RTM finalization.



Use unique constraints and idempotency protection to prevent duplicate ownership, duplicate charges, and repeated sales.



Timers must use server time. Browser countdowns are display-only.



Keep an append-only audit log for trades, retention submissions, purse adjustments, bids, RTM decisions, and final sales.



\## 14. Pre-auction validation report



Before the auction starts, display a report for every team showing:



\- Current squad size.

\- Overseas-player count.

\- Capped and uncapped counts.

\- Retained players.

\- Released players.

\- Remaining purse.

\- Minimum squad-size requirement still to satisfy.

\- Maximum remaining squad slots.

\- RTM allowance, if enabled.

\- Any missing or unverified player data.



The auction must not start if a critical rule violation remains unresolved.



\## 15. Official sources and rule-versioning



Store the selected ruleset version with each room.



Use the official IPL/BCCI publications as the primary reference for official rules:



\- IPL Governing Council announcement of player regulations for 2025–2027.

\- IPL 2026 player retention announcement.

\- IPL 2026 auction list announcement.



Keep official rules separate from custom settings. If the website supports a future season, add a new versioned ruleset instead of silently changing existing room rules.

\---

## 15\. User interface and pages

Create a polished, modern cricket-auction visual style. Make it
responsive for desktop, tablet, and mobile.

### Public pages

1. Landing page

   * Product title and short explanation
   * Create Room
   * Join Room using invite link/code
2. Room lobby

   * Invite link and copy button
   * Team selection grid
   * 10 team slots
   * Live participant count
   * Full/waiting state

### In-room pages

3. Room dashboard

   * Current phase
   * Countdown where relevant
   * Team and participant overview
   * Activity feed
4. Trading centre

   * Current squad
   * Trade proposal form
   * Incoming/outgoing proposals
   * Accept/reject actions
   * Five-minute countdown
5. Retention page

   * Player list
   * Retain/release controls
   * Submission status
   * Confirmation before locking
6. Purse dashboard

   * Team purse summary
   * Deductions and adjustments
   * Remaining purse
7. Auction room

   * Current player profile
   * Player role, nationality, and overseas status
   * Base price and current bid
   * Automated bid timeline
   * Team purse indicators
   * RTM status and decision
   * Sold/unsold result
8. Final results

   * Final squad for each team
   * Total spend and remaining purse
   * Retained players, trades, auction purchases
   * Unsold players
   * Full event/auction history

### Admin/room-owner controls

* Create room
* Start trading when all teams are selected
* Configure purse and auction settings before start
* View room health and participant connections
* Pause/resume auction if enabled
* Reset a room only before irreversible stages, with confirmation
* End auction with a clear warning and audit log

The room owner must not be able to secretly alter a team's players,
bids, or purse without a logged admin action.

\---

## 16\. Realtime behavior

All participants in a room should see updates without refreshing: - New
participant joins - Team claimed - Room becomes full - Trading starts
and countdown changes - Trade proposed/accepted/rejected - Trading
closes - Retention submissions and reveal - Purse calculation - Auction
player changes - Automated bids - RTM decisions - Sold/unsold results -
Final squads

Use realtime channels scoped to the room. Validate access on the server.
Do not expose private authentication tokens or privileged data in
realtime payloads.

If a participant disconnects: - The auction must continue on the
server. - Reconnecting should restore their room/team view. - Do not
depend on a browser tab being open for automated bidding or timers.

\---

## 17\. Security and fairness

* Enforce room membership on every room-specific API request.
* Enforce one team per participant and one participant per team at
database level.
* Enforce the 10-person cap atomically.
* Use secure, unguessable room codes.
* Rate-limit room creation and join attempts.
* Validate every trade, retention, bid, and RTM decision server-side.
* Keep secret keys on the server.
* Use database row-level security where appropriate.
* Keep an append-only event/audit history for important actions.
* Do not trust client-provided purse balances, player ownership, timer
values, or auction results.
* Make server time authoritative.
* Ensure a reconnect or duplicate request cannot process the same
trade or sale twice.

\---

## 18\. Testing requirements

Write automated tests for at least the following cases.

### Room and team selection

* Creator creates a room and becomes participant 1.
* First participant can claim any of 10 teams.
* Second participant sees only 9 available teams.
* A team cannot be claimed twice.
* Two users claiming the same team simultaneously results in exactly
one success.
* Tenth participant can claim the final team.
* Eleventh participant is rejected.
* Full room rejects further joins.
* Participant refresh does not create a duplicate membership.
* A room that has started rejects new participants.

### Trading and retention

* Trading closes after 300 seconds according to server time.
* A trade cannot transfer a player twice.
* Invalid trades roll back.
* Pending trades expire when trading closes.
* Retained players stay with their teams.
* Released players enter the auction pool exactly once.
* A team cannot submit invalid retention selections.

### Auction and RTM

* A starting-squad player does not enter the new-player pool.
* A 2026 auction-list player not in any starting squad can enter the
pool.
* No duplicate player appears in the pool.
* Purse cannot become negative.
* Squad-size and overseas limits are enforced.
* Automated bidder cannot bid above its configured valuation.
* RTM is offered only to an eligible former team.
* RTM cannot exceed the team's purse or squad limits.
* Sold player ownership is unique.
* Repeated requests cannot sell or charge for the same player twice.

### Realtime

* Team claims update for all participants.
* A reconnect restores the correct state.
* Auction continues if one or more browsers disconnect.

\---

## 19\. Build plan for Antigravity

Ask Antigravity to work in this order. Do not skip ahead if a stage is
failing.

### Stage 1 --- Inspect and scaffold

* Inspect the existing repository.
* Identify the current framework and installed packages.
* Create a short implementation plan.
* Set up the frontend, backend connection, environment variables, and
project structure.
* Create a README and `.env.example`.
* Do not commit secrets.

**Acceptance:** App starts locally and connects to the development
database.

### Stage 2 --- Database and seed data

* Create migrations for the tables above.
* Seed the 10 teams.
* Import verified 2026 starting squads.
* Import the verified 2026 auction player list separately.
* Add data validation and duplicate detection.

**Acceptance:** A script can report each team's starting squad and
identify eligible new auction-list players without duplicates.

### Stage 3 --- Room creation and joining

* Build create-room flow.
* Generate shareable invite URL.
* Build join-room flow.
* Build live lobby.
* Implement atomic first-come-first-served team claiming.
* Enforce exactly 10 participants maximum.

**Acceptance:** The 10th participant can claim the final team; the 11th
is rejected, including under simultaneous join attempts.

### Stage 4 --- Room state and realtime

* Implement room state machine.
* Add realtime events.
* Add reconnect behavior.
* Add server-controlled phase timers.

**Acceptance:** All 10 participants see the same room state and
transitions.

### Stage 5 --- Trading

* Implement five-minute trading window.
* Implement trade proposals and accept/reject.
* Add transaction validation and event history.

**Acceptance:** A valid accepted trade changes ownership once; invalid
trades do not change anything.

### Stage 6 --- Retention and purse

* Build retain/release interface.
* Lock submissions.
* Calculate purse on the server using configurable rules.

**Acceptance:** Every team sees a reproducible purse calculation and
retained/released lists.

### Stage 7 --- Auction pool

* Combine released players with eligible new players from the 2026
auction list.
* Validate uniqueness and eligibility.
* Show pool preview.

**Acceptance:** No retained or currently owned player appears in the
pool; eligible new players are included once.

### Stage 8 --- Automated auction and RTM

* Implement team bidding profiles.
* Implement bid validation and auction engine.
* Implement RTM eligibility and configurable matching-price logic.
* Persist all bids and results.

**Acceptance:** A complete test auction runs without invalid bids,
negative purses, or duplicate ownership.

### Stage 9 --- Results and polish

* Build final squad pages and auction history.
* Add loading, empty, error, and reconnect states.
* Improve mobile layout and accessibility.
* Add end-to-end tests.

**Acceptance:** A full 10-person room can complete the workflow from
creation to final results.

\---

## 20\. Instructions to give Antigravity

Paste this instruction after adding this file to the project:

> Read `README.md` completely and treat it as the product requirements
> document. First inspect the existing repository and report the current
> stack and implementation plan. Then implement the project in the
> numbered stages in section 19. Do not skip stages or generate
> placeholder behavior for critical features. In particular, room
> capacity, first-come-first-served team selection, unique team
> ownership, server-authoritative timers, player ownership, purse
> validation, automated bidding, and RTM must be enforced on the
> backend/database, not only in the UI. Use verified 2026 IPL squad and
> auction-list data; do not invent player records. If the exact data is
> not available in the repository, create the import format and clearly
> identify the missing source files instead of fabricating data. After
> each stage, run tests, report what passed and failed, and wait for
> approval before moving to the next stage if a major design decision or
> external service setup is required.

\---

## 21\. Decisions to keep configurable

Do not silently assume these rules. Put them in room settings and show
them to participants before the room starts:

* Starting purse
* Contract-price treatment for retained players
* Retention limits, if any
* Squad size and overseas-player limits
* Trade constraints
* Auction base prices and bid increments
* Automated bidder strategy settings
* RTM eligibility
* RTM matching-price rule
* Whether unsold players can return in a later round
* Whether the room owner can pause or end the auction

**Default room capacity is not configurable in the first version: it is
exactly 10 participants for 10 teams.**

## 22\. Definition of done

The website is ready for its first usable release when:

* A user can create a room and copy its invite link.
* Exactly 10 participants can join and each can claim one unique team.
* The 11th participant is blocked.
* The lobby updates live for everyone.
* All teams start with verified 2026 squads.
* Trading lasts five minutes and ownership updates correctly.
* Teams can submit retentions and releases.
* Purse balances are calculated from configured rules.
* Auction pool contains released players and eligible new players from
the 2026 auction list.
* Automated bidding works with purse, squad, and overseas checks.
* RTM works under the configured rules.
* Final squads, purse balances, and event history are visible.
* Critical flows have automated tests.
* No critical business rule is enforced only in the browser.

