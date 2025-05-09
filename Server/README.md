Steps to add story:
1. Create a quest
2. Create a subquest for the quest referencing the quest id
3. Create a position for the subquest also referencing the location and npc involved
4. Create a dialogue referencing a position which the dialogue belong to

If player need to receive or give item in a dialogue or choice:
1. Create all the item required
2. Create a package for the dialogue to receive or give item
3. Create a package detail for each item to be added in to the package to receive or give from the player mentioning amount of the specific item to receive
4. If player is giving item, amount set to negative
5. Take the package id and reference in dialogue

If dialogue has choice(s):
1. Create a choice referencing the dialogue it belongs to
2. If the choice will give or take item from player, follow the same step as above^
3. If choice will be giving or taking item from player, meanwhile dialogue will also be giving or taking item from player, botht the dialogue and the choice connected will have package id and will be a different package id

If dialogue has action:
1. Choose an action to apply
2. Properties of the action need to let me know to be hardcoded
3. The current available action is karbot_jump

When there are more than one npc in a subquest:
1. Create a new position with the location (might be same or different as the previous one) and the second npc involved
2. Make sure the position id is unique (must be different from the previous one)
3. Dialogue for the second npc will reference position with the second position id

For narrator:
1. Create a position with a unique position id
2. Put in the location involved and subquest for the narrator to start the dialogue
3. Set the npc to narrator
4. Set coordinates to be null
5. Create dialogue for the narrator referencing the position id created in step 1

If npc need to spawn or appear in a subquest:
1. Create a position referencing the location, subquest and npc involved as any other npc
2. If the npc do not need to say anything, no dialogue is required to create for the position

When a dialogue is meant to proceed to the next subquest:
1. Create a package for the dialogue referencing the next subquest to proceed after finishing current subquest
2. Use the item with item with type milestone, only one milestone item is required in the game
3. Create package detail for the milestone item with amount 1 referencing the milestone item and the package id
4. If there are other items that the dialogue will provide, create package detail for the other items with amount and referencing the same package id for the milestone item

Current available npc:
grand_compiler, auntie_ang, uncle_chong, ava, gatekeeper_axion, grandpa, wai, sir_ben, karbot_A, karbot_B, karbot, cipher, lina, airbot, icebot, lightningbot, firebot, earthbot, waterbot