# English Translations of French Documentation

## Installation Guide (LISEZ-MOI.txt)

### GAMEPAD CONTROL OVERHAUL 4.5 HOSAS

Play Star Citizen with a controller without compromise. 6-axis analog movement, flight and ground combat, camera control, view management, menu, interaction, inventory, social - all united in a single objective: playability.

---

### Installation Guide for "Gamepad Control Overhaul" Profile for Star Citizen

**Step 1 - Install ReWASD**
Download and install the ReWASD application, which will establish the link between the controller and the game. Note: this is paid software offering a subscription or lifetime license. A 7-day free trial is also available.

**Step 2 - Required Controller**
Use an Xbox Elite Series 1 or 2 controller.

**Step 3 - Extract the Profile**
Extract the contents of the GCO 4.5 HOSAS.rar file.

**Step 4 - Activate the Controller**
Turn on your Xbox Elite controller.

**Step 5 - Configuration in ReWASD**
1. Open ReWASD
2. Click the dropdown menu at the top left
3. Select "Add a game profile" → name it, for example: Star Citizen
4. Click "Add"
5. Select Config 1 → Import
6. Choose the recently extracted file GCO 4.5 HOSAS.rewasd
7. Click "Apply to slot 1" (bottom left)

**Step 6 - Install the XML Layout**
Copy the file layout_GCO-4-5-HOSAS.xml to the following directory:
`C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\USER\Client\0\Controls\Mappings`

**Step 7 - Activate the Profile in Game**
1. Launch Star Citizen
2. Go to Options > Keybindings > Advanced Control Customization > Control Profiles
3. Select the profile GCO-4-5-HOSAS
4. Set:
   - Keyboard → Keyboard
   - Mouse → Mouse
   - Controller → N/A
5. Validate

**Step 8 - Gameplay Settings**
In the Settings menu, configure the following options (French translation by Cirque Lisoir):
- Vibration = No
- Interaction Mode (Toggle) = No
- Sprint (Toggle) = Yes
- Crawl (Toggle) = Yes
- Crouch (Toggle) = Yes

**Recommended:**
- Keybind Hints = No
- Interaction Prompt: Display Input Icons = No
- Highlight Mode = Always

**Step 9 - Controller Sensitivity**
In Controls, select the controller at the bottom right of the screen, then adjust sensitivity according to the second image provided on the mod page.

**Step 10 - Keyboard Shortcuts Configuration**
Configure shortcuts according to the third image on the mod page.

**Step 11 - Nvidia App** (For Nvidia card owners)
1. Open the Overlay with Alt + Z
2. Click the gear icon at the top right of the window
3. Open the "shortcuts" menu
4. Set the functions as shown in the fourth image of this mod

**Step 12 - Function Test**
In the game, open the Mobiglass with the Xbox button, then close it by pressing "Y".

**Step 13 - Verification**
If this last action works, the profile is correctly installed. Otherwise, restart from step 3.

---

### WARNING

This profile uses many keys associated with the "ALT G" and "ALT D" activators. Make sure to close external applications using the following shortcuts:

**Left Alt combinations:**
- LAlt + 1
- LAlt + G
- LAlt + J
- LAlt + H
- LAlt + PgUp
- LAlt + NumPAD *
- LAlt + V

**Right Alt combinations:**
- RAlt + NumPAD 0
- RAlt + Y
- RAlt + END
- RAlt + P
- RAlt + K
- RAlt + M
- RAlt + G
- RAlt + NumPAD *
- RAlt + V
- RAlt + ;
- RAlt + NumPAD 6
- RAlt + Right
- RAlt + PgDown
- RAlt + NumPAD 4
- RAlt + Left
- RAlt + PgUp

---

## Mapping Reference (Fichier Texte Des Raccourcis GCO 4.5.txt)

### Legend

**Activation Types:**
- (B) Toggle
- (M) Hold
- (L) Long Press
- (1) Single Tap
- (2) Double Tap

**Gameplay Modes:**
- IM - Interaction Mode
- AM - Weapon Modification
- I - Inventory
- IR - Quick Inventory
- V - Aircraft/Spaceship
- TB - Tractor Beam
- SC - Scan
- TM - Turret Mode
- R - Salvage
- MI - Mining
- VT - Ground Vehicle
- FPS - First Person View
- TPS - Third Person View
- EVA - Zero-G Exit
- MB - Mobiglass

**Modifiers:**
- [M1] - LS Bump (Hold)
- [M2] - LB (Hold)
- [M3] - VIEW (Hold)
- [M4] - XBOX (Toggle)
- [M5] - MENU (Hold)
- [M6] - RB (Hold)
- [M7] - Y (Toggle)

---

### A Button

| Modifier | Action | Activation |
|----------|--------|------------|
| None | Quick interaction | - |
| None | Send message and exit chat window | (1) |
| [M1] | Increase rear shield | - |
| [M2] | Toggle scan mode | (L) |
| [M2] | Cycle mode | (1) |
| [M7] | Turn engines on/off | (1) |
| [M7] | Turn power on/off | (L) |
| None | IR - Exit quick search inventory | (1) |
| [M2] | V - Toggle SCM/NAV | (2) |
| None | FPS - Exit contextual actions | (1) |
| None | FPS - Search/loot | (L) |
| None | FPS - Disable movement and enter console | (L) |
| None | FPS - Re-enable movement and exit console | (1) |
| [M2] | FPS - Remove/put on helmet | (L) |
| [M3] | FPS - Quick purchase targeted item | (L) |
| [M7] | FPS - Open/close inventory | (1) |
| [M7] | FPS - Open/close quick inventory | (L) |
| [M4] | MB - Select and set route on Starmap | (L) |
| [M4] | MB - Add marker on ground map | (1) |
| [M4] | MB - Send message | (1) |

---

### B Button

| Modifier | Action | Activation |
|----------|--------|------------|
| None | Headlights | (1) |
| None | Delete text | - |
| [M1] | Increase right shield | - |
| [M2] | Clean helmet | (1) |
| [M2] | Change vehicle aim mode | (L) |
| None | V - Release flare | (L) |
| None | V - Release chaff | (2) |
| None | V - Load multiple decoys | (M) |
| None | FPS - Change fire mode | (L) |
| None | FPS - Interact with scope | (L) |
| None | FPS - Under-barrel attachment | (2) |
| None | FPS - Flashlight | (1) |
| [M4] | MB - Delete marker on map | (1) |

---

### X Button

| Modifier | Action | Activation |
|----------|--------|------------|
| None | Change weapon group | (1) |
| None | Change missile type | (L) |
| [M1] | Increase left shield | - |
| [M7] | AM - Weapon attachment menu | (L) |
| None | V - Toggle SCM missile/weapons and NAV navigation/flight | (L) |
| [M2] | V - Request landing/takeoff authorization | (1) |
| [M7] | V - Request auto-loading | (1) |
| [M7] | V - Auto-land | (L) |
| [M2] | R - Salvage mode | (L) |
| [M2] | MI - Mining mode | (L) |
| None | FPS - Reload | (1) |
| None | FPS - Holster/draw weapon | (L) |
| None | FPS - Toggle between fists/knife | (2) |
| [M2] | FPS - Refill equipped incomplete magazines | (1) |
| [M2] | FPS - Lower weapon | (L) |
| [M7] | FPS - Open emotes menu | (1) |

---

### Y Button (Modifier 7)

| Modifier | Action | Activation |
|----------|--------|------------|
| None | INTERACTION MODE | (B) |
| None | Exit Main Menu | (1) |
| None | Close Scoreboard | (1) |
| None | Cancel message and exit chat window | (1) |
| [M1] | Increase front shield | - |
| [M3] | Show/Hide chat | (1) |
| [M3] | Write in chat window when displayed | (L) |
| [M7] | Exit thought wheel selecting action (except emotes) | (1) |
| [M7] | Exit seat | (L) |
| [M7] [M2] | IM - Exit interaction mode without leaving contextual action | (1) |
| [M7] | AM - Exit weapon attachment menu | (1) |
| [M7] | I - Exit inventory | (1) |
| [M7] | IR - Exit quick inventory | (1) |
| [M2] | V - Enable/disable alternating fire | (1) |
| [M5] | TM - Turret mode, activates aiming on LS and RS | (B) |
| [M5] | FPS - Disable movement | (1) |
| [M7] | FPS - Enable movement | (1) |
| [M7] | FPS - Exit contextual action | (1) |
| [M4] | MB - Exit | (1) |

---

### VIEW Button (Modifier 3)

| Modifier | Action | Activation |
|----------|--------|------------|
| None | FREE CAMERA | (M) |

---

### XBOX Button (Modifier 4)

| Modifier | Action | Activation |
|----------|--------|------------|
| None | OPEN MOBIGLASS | (1) |
| [M2] | OPEN MAP | (1) |
| None | Open Scoreboard | (1) |

---

### MENU Button (Modifier 5)

| Modifier | Action | Activation |
|----------|--------|------------|
| None | CHANGE VIEW | (1) |
| [M7] | Show/Hide HUD | (L) |
| [M2] | MI - Release cargo | (L) |
| [M3] | V - Self-destruct | (L) |
| [M3] | FPS - Suicide | (L) |

---

### Right Stick (RS)

**RS Up:**
| Modifier | Action |
|----------|--------|
| [M3] | Free Camera up |
| [M7] | IM - Move cursor up |
| None | V - Pitch up |
| [M3] | TB - Pitch up |
| None | VT - Aim up |
| None | FPS - Look up |
| [M5] | TPS - Rotate camera down |
| None | EVA - Pitch up |
| [M4] [M3] | MB - Move ground map camera up |
| [M4] | MB - Move cursor up |

**RS Down:**
| Modifier | Action |
|----------|--------|
| [M3] | Free Camera down |
| [M7] | IM - Move cursor down |
| None | V - Pitch down |
| [M3] | TB - Pitch down |
| None | VT - Aim down |
| None | FPS - Look down |
| [M5] | TPS - Rotate camera up |
| None | EVA - Pitch down |
| [M4] [M3] | MB - Move ground map camera down |
| [M4] | MB - Move cursor down |

**RS Left:**
| Modifier | Action |
|----------|--------|
| [M3] | Free Camera left |
| [M7] | IM - Move cursor left |
| None | V - Yaw left |
| [M3] | TB - Yaw left |
| None | VT - Aim left |
| None | FPS - Look left |
| [M5] | TPS - Rotate camera right |
| None | EVA - Yaw left |
| [M4] [M3] | MB - Move ground map camera left |
| [M4] | MB - Move cursor left |

**RS Right:**
| Modifier | Action |
|----------|--------|
| [M3] | Free Camera right |
| [M7] | IM - Move cursor right |
| None | V - Yaw right |
| [M3] | TB - Yaw right |
| None | VT - Aim right |
| None | FPS - Look right |
| [M5] | TPS - Rotate camera left |
| None | EVA - Yaw right |
| [M4] [M3] | MB - Move ground map camera right |
| [M4] | MB - Move cursor right |

**RS Click (RS Bump):**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Exit seat | (L) |
| [M1] | Reset shield power | (1) |
| [M2] | Pin and lock visual target | (1) |
| [M2] | Unpin visual target | (L) |
| [M7] | Exit seat | (L) |
| [M7] | I - Exit inventory | (L) |
| None | I - Show item options | (1) |
| None | IR - Change menu | (1) |
| None | IR - Show weapon attachment menu | (1) |
| [M7] | IR - Exit quick inventory | (L) |
| None | V - Toggle coupled mode | (1) |
| [M3] | V - Toggle atmospheric flight assist | (1) |
| None | FPS - Exit contextual action | (L) |
| None | FPS - Execution in close combat | (1) |
| None | FPS - Inspect item in hand | (L) |
| [M4] | MB - Reset map to player | (1) |

---

### D-Pad

**D-Pad Up:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Scroll up and left | - |
| None | Increase map zoom | - |
| None | Increase engine power | (1) |
| None | Increase engine power to max | (L) |
| [M2] | Reset sub-targeting | (1) |
| [M3] | Increase speed limiter | - |
| [M6] | Decrease engine power | (1) |
| [M6] | Decrease engine power to min | (L) |
| None | FPS - Draw gadget | (1) |
| None | FPS - Increase scope convergence | (1) |
| None | FPS - Show weapons wheel | (M) |
| [M5] | TPS - Load saved view #1 | (1) |
| [M5] | TPS - Save view #1 | (L) |
| [M4] | MB - Scroll up | - |

**D-Pad Down:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Scroll down and right | - |
| None | Decrease map zoom | - |
| None | Select next pinned target | (1) |
| None | Reset power points | (L) |
| [M3] | Decrease speed limiter | - |
| [M2] | Disengage and remove all pinned targets | (2) |
| [M2] | Disengage target | (L) |
| [M2] | Lock target | (1) |
| None | FPS - Draw equipped syringe | (1) |
| None | FPS - Decrease scope convergence | (1) |
| None | FPS - Show equipped syringes wheel | (M) |
| [M6] | FPS - Drop item in hand | (L) |
| [M5] | TPS - Load saved view #3 | (1) |
| [M5] | TPS - Save view #3 | (L) |
| [M4] | MB - Scroll down | - |

**D-Pad Left:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Increase weapons power | (1) |
| None | Increase weapons power to max | (L) |
| None | Scroll insert cursor left | - |
| [M2] | Previous sub-target | (1) |
| [M6] | Decrease weapons power | (1) |
| [M6] | Decrease weapons power to min | (L) |
| [M7] | Turn weapons on/off | (1) |
| [M7] | Lock/Unlock component ports | (1) |
| [M3] | R - Select left salvage tool | (1) |
| [M3] | MI - Select mining module #1 | (1) |
| [M3] | MI - Select mining module #3 | (L) |
| None | FPS - Toggle primary/secondary weapon | (1) |
| None | FPS - Draw sidearm | (L) |
| None | FPS - Draw secondary weapon | (2) |
| [M5] | TPS - Load saved view #4 | (1) |
| [M5] | TPS - Save view #4 | (L) |

**D-Pad Right:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Increase shields power | (1) |
| None | Increase shields power to max | (L) |
| None | Scroll insert cursor right | - |
| [M2] | Next sub-target | (1) |
| [M6] | Decrease shields power | (1) |
| [M6] | Decrease shields power to min | (L) |
| [M7] | Turn shields on/off | (1) |
| [M7] | Open/Close doors | (L) |
| [M3] | R - Select right salvage tool | (1) |
| [M3] | MI - Select mining module #2 | (1) |
| [M3] | MI - Select mining module #4 | (L) |
| None | FPS - Draw equipped throwable | (1) |
| None | FPS - Show equipped throwables wheel | (M) |
| [M5] | TPS - Load saved view #2 | (1) |
| [M5] | TPS - Save view #2 | (L) |

---

### Left Stick (LS)

**LS Up:**
| Modifier | Action |
|----------|--------|
| None | Move forward / Increase cruise control |
| [M7] | IM - Move cursor up |
| [M3] | V - Increase bomb HUD range |
| [M6] | V - Strafe up |
| [M3] | TB - Push object away |
| [M3] | SC - Widen scanner radius |
| [M3] | R - Push salvage beams away |
| [M3] | MI - Increase mining laser power |
| None | FPS - Exit contextual action (except carts) |
| [M5] | TPS - Move camera forward |
| [M4] [M5] | MB - Move ground map camera up |
| [M4] | MB - Move cursor up |

**LS Down:**
| Modifier | Action |
|----------|--------|
| None | Move backward / Decrease cruise control |
| [M7] | IM - Move cursor down |
| [M3] | V - Decrease bomb HUD range |
| [M6] | V - Strafe down |
| [M3] | TB - Pull object closer |
| [M3] | SC - Narrow scanner radius |
| [M3] | R - Pull salvage beams closer |
| [M3] | MI - Decrease mining laser power |
| None | FPS - Exit contextual action (except carts) |
| [M5] | TPS - Move camera backward |
| [M4] [M5] | MB - Move ground map camera down |
| [M4] | MB - Move cursor down |

**LS Left:**
| Modifier | Action | Activation |
|----------|--------|------------|
| [M3] | Change selected MFD to previous tab | (1) |
| [M3] | Select MFD #1 | (L) |
| [M3] | Select MFD #3 | (L) |
| [M3] | Select left holographic MFD | (L) |
| [M7] | IM - Move cursor left | - |
| None | V - Roll left | - |
| [M6] | V - Strafe left | - |
| None | VT - Turn left | - |
| None | FPS - Exit contextual action (except carts) | - |
| None | FPS - Strafe left | - |
| [M5] | TPS - Move camera left | - |
| None | EVA - Roll left | - |
| [M4] [M5] | MB - Move ground map camera left | - |
| [M4] | MB - Move cursor left | - |

**LS Right:**
| Modifier | Action | Activation |
|----------|--------|------------|
| [M3] | Change selected MFD to next tab | (1) |
| [M3] | Select MFD #2 | (L) |
| [M3] | Select MFD #4 | (L) |
| [M3] | Select right holographic MFD | (L) |
| [M7] | IM - Move cursor right | - |
| None | V - Roll right | - |
| [M6] | V - Strafe right | - |
| None | VT - Turn right | - |
| None | FPS - Exit contextual action (except carts) | - |
| None | FPS - Strafe right | - |
| [M5] | TPS - Move camera right | - |
| None | EVA - Roll right | - |
| [M4] [M5] | MB - Move ground map camera right | - |
| [M4] | MB - Move cursor right | - |

**LS Click (LS Bump) - Modifier 1:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Ping | (1) |
| None | Strong ping | (M) |
| None | Manage favorite action in thought wheel | (1) |
| [M3] | Turn cruise control on/off | (1) |
| [M3] | Reset speed limiter | (L) |
| None | I - Allow item swap between inventories | (M) |
| [M7] | IM - Zoom | (B) |
| None | FPS - Crouch | (1) |
| None | FPS - Prone | (L) |
| [M5] | TPS - Reset camera | (1) |

---

### Triggers

**LT (Left Trigger):**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Fix cursor on map for lateral movement | (M) |
| None | Change channel in chat window | (1) |
| None | Show context menu | (1) |
| None | Max zoom | (M) |
| None | Zoom | (1) |
| [M7] | Enter/Exit thought wheel | (1) |
| None | I - Allow camera orbit around player | (M) |
| None | IR - Drop equipped item on ground | (1) |
| None | V - STRAFE LEFT | - |
| None | R - Toggle fracture/disintegration | (2) |
| None | R - Change salvage tool | (1) |
| None | FPS - Aim | (M) |
| None | FPS - Throw underhand | - |
| None | FPS - Unarmed left punch | (1) |
| None | FPS - Unarmed strong left punch | (L) |
| None | FPS - Store inspected item in inventory | (1) |
| None | FPS - Inject syringe into target | (1) |
| [M5] | TPS - Move camera down | - |

**RT (Right Trigger):**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Fire | - |
| None | Fix cursor on map for rotation | (M) |
| None | Interact with cursor element | (1) |
| None | Load additional missile | (1) |
| None | Reset missiles | (2) |
| [M2] | Fire loaded missiles | (L) |
| None | V - Start/interrupt quantum travel | (L) |
| None | V - Open jump point | (1) |
| None | V - STRAFE RIGHT | - |
| [M2] | V - Lock/unlock bomb impact point | (1) |
| [M2] | V - Reset bomb HUD range | (2) |
| None | SC - Scan | (M) |
| None | R - Salvage laser | (B) |
| None | R - Disintegration and fracture | (B) |
| None | R - Toggle scraper heads | (2) |
| None | MI - Mining laser | (B) |
| None | MI - Change mining tool | (2) |
| None | FPS - Throw overhand | - |
| None | FPS - Unarmed right punch | (1) |
| None | FPS - Unarmed strong right punch | (L) |
| None | FPS - Eat/drink | (M) |
| None | FPS - Exit "inspect item" mode | (1) |
| None | FPS - Self-inject syringe | (1) |
| [M5] | TPS - Move camera up | - |

---

### Bumpers

**LB (Left Bumper) - Modifier 2:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | PUT SPEED LIMITER ON STANDBY | (M) |
| None | MI - Decrease mining laser power in vehicle | - |
| None | TB - Pull object closer | - |
| None | FPS - Hold breath | (M) |
| [M5] | TPS - Move camera away from rotation center | - |
| [M4] | MB - Accept popup | - |
| [M7] | MB - Accept popup | - |

**RB (Right Bumper) - Modifier 6:**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | ENABLE ANALOG LATERAL MOVEMENT IN FLIGHT VIA LEFT JOYSTICK | (M) |
| None | MI - Increase mining laser power in vehicle | - |
| None | TB - Push object away | - |
| [M2] | V - Boost | (M) |
| [M5] | TPS - Move camera toward rotation center | - |
| [M4] | MB - Decline popup | (1) |
| [M7] | MB - Decline popup | (1) |

---

### Paddles (Xbox Elite)

**TP-L (Top Left Paddle):**
| Modifier | Action | Activation |
|----------|--------|------------|
| [M7] | IM - Zoom out | - |
| None | I - Move camera away | - |
| None | V - Strafe down | - |
| [M3] | TB - Roll left | - |
| None | FPS - Sprint | (B) |
| [M5] | TPS - Increase field of view | - |
| None | EVA - Strafe down | - |
| [M4] | MB - Load previous zone on ground map | (1) |

**TP-R (Top Right Paddle):**
| Modifier | Action | Activation |
|----------|--------|------------|
| [M7] | IM - Zoom in | - |
| None | V - Strafe up | - |
| [M3] | TB - Roll right | - |
| None | FPS - Jump | (1) |
| [M5] | TPS - Increase focus | - |
| None | EVA - Strafe up | - |
| [M4] | MB - Load next zone on ground map | (1) |

**BP-L (Bottom Left Paddle):**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Strafe left in interaction | - |
| [M7] | I - Rotate camera 90° left | (1) |
| None | V - Strafe left | - |
| None | FPS - Lean left | (B) |
| [M7] | FPS - Previous page in emotes menu | (1) |
| [M5] | TPS - Decrease field of view | - |
| None | EVA - Strafe left | - |
| [M4] | MB - Center camera on next area on ground map | (1) |

**BP-R (Bottom Right Paddle):**
| Modifier | Action | Activation |
|----------|--------|------------|
| None | Strafe right in interaction | - |
| [M7] | I - Rotate camera 90° right | (1) |
| None | V - Strafe right | - |
| None | FPS - Lean right | (B) |
| [M7] | FPS - Next page in emotes menu | (1) |
| [M5] | TPS - Decrease focus | - |
| None | EVA - Strafe right | - |
| [M4] | MB - Center camera on next area on ground map | (1) |

---

### Combos

**LS Bump + RS Bump:**
| Action | Activation |
|--------|------------|
| V - Deploy wings | (L) |
| V - Toggle landing gear | (1) |

**LT + RT:**
| Action | Activation |
|--------|------------|
| FPS - Unarmed block | (M) |

**VIEW + MENU:**
| Action | Activation |
|--------|------------|
| Main Menu | (1) |

**TP-L + TP-R:**
| Action | Activation |
|--------|------------|
| Brake | - |
| Move forward in interaction | - |

**BP-L + BP-R:**
| Action | Activation |
|--------|------------|
| Move backward in interaction | - |
| Go to FPS view | (1) |
| V - Rear view (INVERTED ORIENTATION AND MOVEMENT) | (M) |
| VT - Rear view (INVERTED ORIENTATION AND MOVEMENT) | (M) |
| FPS - Current main third person view (INVERTED MOVEMENT) | (M) |
