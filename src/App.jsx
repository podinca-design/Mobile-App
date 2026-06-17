import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_KEY = "td_session";
const MAX_PLAYERS = 12;
const ROOM_TTL_HOURS = 18;
const ADULT_CATEGORY_IDS = new Set(["spicy", "wild", "couples"]);
const MAX_ROUND_SHOT_PENALTIES = 3;

const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- Content bank ----------------------------------------------------
const CONTENT = {
  "globalRules": {
    "adult_only": true,
    "minimum_age": "21+",
    "age_gate_required": true,
    "content_notice": "This game contains adult-only flirtation, kissing, optional consensual touching, optional consensual clothing removal, optional consensual partial nudity, and alcohol-based penalties. Players must be 21+.",
    "consent_model": {
      "core_rule": "Consent must be affirmative, voluntary, specific, and reversible. No player may be pressured, teased, mocked, negotiated with, or asked repeatedly after saying no.",
      "ask_once_rule": "For any dare involving another player, the active player may ask once. If the other player says yes, the dare may proceed. If the other player says no, hesitates, does not answer clearly, or seems uncomfortable, the active player fails the dare and takes the listed penalty.",
      "no_penalty_for_saying_no": "The person being asked never receives a penalty for saying no. Only the active player receives the penalty if the dare fails.",
      "stop_rule": "Any player may stop a dare at any time. Once stopped, the action ends immediately.",
      "touching_allowed_with_consent": true,
      "kissing_allowed_with_consent": true,
      "french_kissing_allowed_with_consent": true,
      "clothing_removal_allowed_with_consent": true,
      "partial_nudity_allowed_with_consent": true,
      "adult_body_exposure_allowed_with_consent": true,
      "allowed_touch_examples": [
        "holding hands",
        "hand massage",
        "shoulder massage",
        "back rub over clothing",
        "arm around shoulder",
        "knee-to-knee sitting",
        "slow dance",
        "lap sitting only if both players clearly consent",
        "cheek kiss",
        "neck or shoulder kiss",
        "regular kiss",
        "French kiss only if both players clearly consent"
      ],
      "allowed_clothing_examples": [
        "swap an accessory",
        "swap outerwear",
        "remove a jacket",
        "remove a shirt only if the player personally consents",
        "remove a bra only if the player personally consents",
        "wear another consenting player's outerwear or accessory for one round"
      ],
      "allowed_body_reveal_examples": [
        "show shoulder",
        "show arm",
        "show back",
        "show stomach or midriff",
        "show leg",
        "show tattoo",
        "show chest or nipple only if the player personally consents and the setting is private 21+ adults-only"
      ],
      "hard_limits": [
        "No minors or minor-coded content.",
        "No sexual acts.",
        "No explicit sexual instructions.",
        "No forced touching.",
        "No forced kissing.",
        "No forced nudity or exposure.",
        "No repeated asking after no.",
        "No recording, photographing, livestreaming, or posting without explicit consent from every visible person.",
        "No public exposure.",
        "No humiliation, degradation, or targeting protected traits.",
        "No unsafe drinking escalation.",
        "No penalties for a person who refuses to participate in someone else's dare."
      ]
    },
    "penalty_tracking": {
      "enabled": true,
      "penalty_unit": "shots",
      "max_normal_penalties_per_player_per_round": 3,
      "penalty_count_logic": [
        "Increment a player's penalty count only when that player refuses a dare or fails a consent-based dare as the active player.",
        "Do not increment penalty count for a player who says no to being touched, kissed, danced with, involved in exposure, involved in clothing swap, or involved in another player's dare.",
        "Reset all penalty counters at the start of each new round."
      ],
      "on_fourth_penalty": {
        "trigger": "If the same player would receive a 4th shot penalty in the same round.",
        "instead_of_shots": true,
        "label": "Right-Side Consequence",
        "assigned_by": "player_to_the_right",
        "display_text": "You have reached 3 penalties this round. The player to your right now assigns a consent-safe consequence.",
        "rules": [
          "No additional alcohol escalation.",
          "No forced touching.",
          "No forced kissing.",
          "No forced nudity or exposure.",
          "No recording or posting.",
          "No humiliating, unsafe, or degrading consequence.",
          "The player may still pass on anything unsafe or inappropriate."
        ],
        "safe_consequence_examples": [
          "Answer any Wild truth chosen by the player to the right.",
          "Answer any Spicy question chosen by the player to the right.",
          "Do a 20-second dramatic runway walk.",
          "Let the group choose your nickname for the next round.",
          "Give a sincere compliment to three players.",
          "Perform a 20-second karaoke chorus.",
          "Let the player to the right choose your next category.",
          "Do your best fake movie trailer voice for the next prompt."
        ]
      }
    },
    "shot_safety": {
      "non_alcoholic_substitution_allowed": true,
      "substitution_text": "Players may substitute water, soda, juice, or any non-alcoholic drink at any time.",
      "stop_rule": "If a player appears intoxicated, penalties convert to non-alcoholic or non-drinking consequences."
    }
  },
  "categories": [
    {
      "id": "mild",
      "label": "Mild",
      "accent": "#34D6B0",
      "truths": [
        "What's the most embarrassing thing in your search history?",
        "Who was your first celebrity crush?",
        "What's a lie you told that you never got caught for?",
        "What's the weirdest thing you've ever eaten?",
        "What app do you spend the most time on?",
        "What's your most useless talent?",
        "What's the last thing you Googled?",
        "What's your worst habit?",
        "What's a rumor you've heard about yourself?",
        "What's the cringiest thing you did as a teenager?"
      ],
      "dares": [
        "Talk in an accent for the next 3 rounds.",
        "Let the group post anything on your story.",
        "Do your best impression of someone in the room.",
        "Send a voice memo singing the chorus of your favorite song.",
        "Let someone else answer your next 3 texts.",
        "Do 10 jumping jacks right now.",
        "Speak only in questions until your next turn.",
        "Show the group your camera roll's 5th most recent photo.",
        "Let the group pick your profile picture for a day.",
        "Do your best catwalk across the room."
      ]
    },
    {
      "id": "bold",
      "label": "Bold",
      "accent": "#FF5A4E",
      "truths": [
        "What's something you'd never admit to your parents?",
        "Have you ever cheated on a test, partner, or game?",
        "What's the boldest thing you've done to get someone's attention?",
        "What's a secret you've never told anyone in this room?",
        "What's the riskiest thing you've ever done for love?",
        "Who in this room would you trust with a secret, and who wouldn't you?",
        "What's the most trouble you've been in and not gotten caught for?",
        "What's a white lie you tell often?"
      ],
      "dares": [
        "Let the group go through your texts for 30 seconds.",
        "Call a friend and tell them you love them, no context.",
        "Do an embarrassing dance for 30 seconds.",
        "Let someone draw on your face with a marker.",
        "Reveal the last thing you searched on your phone.",
        "Prank call someone in your contacts.",
        "Let the group rename you in their phone for a week.",
        "Eat something the group picks for you, no questions asked."
      ]
    },
    {
      "id": "couples",
      "label": "Couples / Flirty",
      "accent": "#E0529C",
      "truths": [
        "What was your first impression of me, really?",
        "What's a small thing I do that you secretly love?",
        "What's the most attracted you've ever been to me?",
        "What's a fantasy date you've never told me about?",
        "What's one thing you find irresistible in a partner?",
        "What's the moment you knew you were falling for me?",
        "What's something flirty you've always wanted to say to me but haven't?",
        "What's a memory of us that gives you butterflies?",
        {
          "id": "couples_private_truth_001",
          "text": "What is one touch from your partner that gets your attention immediately?",
          "intensity": 4
        },
        {
          "id": "couples_private_truth_002",
          "text": "What is one part of your partner's body you love more than they realize?",
          "intensity": 4
        },
        {
          "id": "couples_private_truth_003",
          "text": "What is one private compliment you should say to your partner more often?",
          "intensity": 3
        },
        {
          "id": "couples_private_truth_004",
          "text": "What is one thing your partner wears that makes it hard to focus?",
          "intensity": 3
        },
        {
          "id": "couples_private_truth_005",
          "text": "What is one adult-only private mood you would like to create together?",
          "intensity": 4
        },
        {
          "id": "couples_private_truth_006",
          "text": "What is one thing your partner does that makes you feel wanted?",
          "intensity": 3
        },
        {
          "id": "couples_private_truth_007",
          "text": "What is one kiss you still remember?",
          "intensity": 4
        },
        {
          "id": "couples_private_truth_008",
          "text": "What is one way your partner could flirt with you more often?",
          "intensity": 3
        },
        {
          "id": "couples_private_truth_009",
          "text": "What is one thing you want to be more confident asking your partner for?",
          "intensity": 4
        },
        {
          "id": "couples_private_truth_010",
          "text": "What is one thing your partner does really well but does not hear enough?",
          "intensity": 3
        }
      ],
      "dares": [
        "Whisper the nicest thing you've ever thought about me.",
        "Give me a slow, lingering hug for 20 seconds.",
        "Write a flirty one-line text and send it to me right now.",
        "Hold eye contact with me for 30 seconds without laughing.",
        "Describe your perfect date with me in 3 sentences.",
        "Give me a compliment you've never said out loud before.",
        "Slow dance with me for 30 seconds, no music needed.",
        "Tell me your favorite thing about how we kiss.",
        {
          "id": "couples_private_dare_001",
          "text": "Ask your partner if you may kiss them like you are trying to restart the night. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "couples_private_dare_002",
          "text": "Ask your partner if you may French kiss them for 10 seconds. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "french_kiss": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "couples_private_dare_003",
          "text": "Ask your partner if you may kiss their neck or shoulder for 10 seconds. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "couples_private_dare_004",
          "text": "Swap one clothing item, outerwear item, or accessory with your partner for one round, only if both agree.",
          "requires_consent": true,
          "clothing_swap": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "couples_private_dare_005",
          "text": "Ask your partner if you may place your hand on their knee or waist for the next prompt. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "couples_private_dare_006",
          "text": "Show your partner one body area you personally consent to show in this private 21+ setting. You control what is shown.",
          "requires_self_consent": true,
          "adult_body_reveal": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 5
        },
        {
          "id": "couples_private_dare_007",
          "text": "Ask your partner if they will slow dance with you for 30 seconds. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 1,
            "text": "Take 1 shot."
          },
          "intensity": 3
        },
        {
          "id": "couples_private_dare_008",
          "text": "Remove one clothing item you personally consent to remove for one round. You choose the item. No one else may choose for you.",
          "requires_self_consent": true,
          "clothing_removal": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "couples_private_dare_009",
          "text": "Tell your partner one thing you want more of later, keeping it non-graphic.",
          "requires_consent": false,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "couples_private_dare_010",
          "text": "Ask your partner if you may kiss them somewhere they choose. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        }
      ]
    },
    {
      "id": "spicy",
      "label": "Spicy 21+",
      "accent": "#D946EF",
      "description": "Adult 21+ flirtation, kissing, optional consensual touch, optional consensual clothing removal, and optional consensual partial nudity.",
      "adultOnly": true,
      "truths": [
        {
          "id": "spicy_truth_001",
          "text": "What kind of touch gets your attention fastest when the chemistry is already there?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_002",
          "text": "What is one body part you find attractive that people do not talk about enough?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_003",
          "text": "What type of kiss gets you in trouble the fastest?",
          "intensity": 4
        },
        {
          "id": "spicy_truth_004",
          "text": "What is one clothing item someone can wear that immediately gets your attention?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_005",
          "text": "What is one flirty move that works on you even when you know exactly what they are doing?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_006",
          "text": "What is one compliment about your body that would make you blush?",
          "intensity": 4
        },
        {
          "id": "spicy_truth_007",
          "text": "What is the boldest kind of kiss you would say yes to in the right moment?",
          "intensity": 4
        },
        {
          "id": "spicy_truth_008",
          "text": "What is one thing you wear when you want to feel dangerously attractive?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_009",
          "text": "What is one part of your body you are most confident about?",
          "intensity": 3
        },
        {
          "id": "spicy_truth_010",
          "text": "What is one adult-only dare you would consider saying yes to with the right person?",
          "intensity": 4
        }
      ],
      "dares": [
        {
          "id": "spicy_dare_001",
          "text": "Ask one player if you may hold their hand for the next prompt. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 1,
            "text": "Take 1 shot."
          },
          "intensity": 2
        },
        {
          "id": "spicy_dare_002",
          "text": "Ask one player if you may give them a 10-second shoulder massage. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "spicy_dare_003",
          "text": "Ask one player if they will swap an accessory or outerwear item with you for one round. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "clothing_swap": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "spicy_dare_004",
          "text": "Ask one player if they will slow dance with you for 20 seconds. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "spicy_dare_005",
          "text": "Show one body area you personally consent to show in this private 21+ setting. You control what is shown. No one else may choose for you.",
          "requires_self_consent": true,
          "adult_body_reveal": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "spicy_dare_006",
          "text": "Ask one player if you may sit knee-to-knee with them for one round. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "spicy_dare_007",
          "text": "Remove one clothing item you personally consent to remove for one round. You choose the item. No one else may choose for you.",
          "requires_self_consent": true,
          "clothing_removal": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "spicy_dare_008",
          "text": "Ask one player if you may kiss them. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "spicy_dare_009",
          "text": "Ask one player if they would consent to a French kiss. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "french_kiss": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "spicy_dare_010",
          "text": "Ask one player if you may put your arm around their shoulder for the next prompt. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "spicy_dare_011",
          "text": "Ask one player if they will choose one accessory or outerwear item for you to remove or wear for one round. Ask once only. If they say no, you fail the dare. You may refuse any item choice that feels uncomfortable.",
          "requires_consent": true,
          "clothing_swap": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "spicy_dare_012",
          "text": "Ask one player if they will kiss you on the cheek, neck, or shoulder. They choose the option if they consent. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        }
      ]
    },
    {
      "id": "wild",
      "label": "Wild 21+",
      "accent": "#FFB84D",
      "description": "Bold, chaotic, adult 21+ party prompts with consent checks, kissing, clothing swaps, optional body reveal, and shot penalties.",
      "adultOnly": true,
      "truths": [
        {
          "id": "wild_truth_001",
          "text": "Who here gives the most dangerous innocent smile?",
          "intensity": 2
        },
        {
          "id": "wild_truth_002",
          "text": "What is the wildest harmless thing you have done to get someone's attention?",
          "intensity": 3
        },
        {
          "id": "wild_truth_003",
          "text": "What is one physical feature you are most confident about?",
          "intensity": 3
        },
        {
          "id": "wild_truth_004",
          "text": "What is the boldest compliment you have ever given?",
          "intensity": 3
        },
        {
          "id": "wild_truth_005",
          "text": "What is one outfit you wore that made you feel unstoppable?",
          "intensity": 2
        },
        {
          "id": "wild_truth_006",
          "text": "Who here looks like they would be the best bad influence?",
          "intensity": 2
        },
        {
          "id": "wild_truth_007",
          "text": "What is your most dangerous flirting habit?",
          "intensity": 3
        },
        {
          "id": "wild_truth_008",
          "text": "What is one thing you would only admit after midnight?",
          "intensity": 3
        },
        {
          "id": "wild_truth_009",
          "text": "What is the most trouble you have talked your way out of?",
          "intensity": 3
        },
        {
          "id": "wild_truth_010",
          "text": "What is one thing people underestimate about your wild side?",
          "intensity": 3
        }
      ],
      "dares": [
        {
          "id": "wild_dare_001",
          "text": "Ask one player if they will swap an accessory, outerwear item, or clothing item with you for one round. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "clothing_swap": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 4
        },
        {
          "id": "wild_dare_002",
          "text": "Show your best runway walk using the room as your stage.",
          "requires_consent": false,
          "penalty": {
            "type": "shots",
            "count": 1,
            "text": "Take 1 shot."
          },
          "intensity": 2
        },
        {
          "id": "wild_dare_003",
          "text": "Ask one player if you may do a 20-second slow dance with them. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "wild_dare_004",
          "text": "Remove one clothing item you personally consent to remove for one round. You choose the item. No one else may choose for you.",
          "requires_self_consent": true,
          "clothing_removal": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "wild_dare_005",
          "text": "Ask one player if you may kiss them. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "wild_dare_006",
          "text": "Show one body area you personally consent to show in this private 21+ setting. You control what is shown. No one else may choose for you.",
          "requires_self_consent": true,
          "adult_body_reveal": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 5
        },
        {
          "id": "wild_dare_007",
          "text": "Ask one player if you may place your arm around their shoulder for the next prompt. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "penalty": {
            "type": "shots",
            "count": 2,
            "text": "Take 2 shots."
          },
          "intensity": 3
        },
        {
          "id": "wild_dare_008",
          "text": "Let the group create your fake dating app headline and read it like you believe every word.",
          "requires_consent": false,
          "penalty": {
            "type": "shots",
            "count": 1,
            "text": "Take 1 shot."
          },
          "intensity": 2
        },
        {
          "id": "wild_dare_009",
          "text": "Ask one player if they will French kiss you. Ask once only. If they say no, you fail the dare.",
          "requires_consent": true,
          "kissing": true,
          "french_kiss": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        },
        {
          "id": "wild_dare_010",
          "text": "Ask one player if they will choose one clothing item, outerwear item, or accessory for you to remove or wear for one round. Ask once only. If they say no, you fail the dare. You may refuse any choice that feels uncomfortable.",
          "requires_consent": true,
          "clothing_swap": true,
          "clothing_removal": true,
          "penalty": {
            "type": "shots",
            "count": 3,
            "text": "Take 3 shots."
          },
          "intensity": 5
        }
      ]
    }
  ],
  "questionsMode": {
    "mild": [
      "What's a small thing that instantly improves your day?",
      "What's a skill you wish you had?",
      "What's the best advice you've ever received?",
      "What's a place you've never been but really want to visit?",
      "What's your go-to comfort food?",
      "What's a memory that always makes you smile?",
      "What's something you're proud of that most people don't know about?",
      "If you could have dinner with anyone, living or dead, who would it be?"
    ],
    "bold": [
      "What's a belief you held strongly that you later changed your mind about?",
      "What's the bravest thing you've ever done?",
      "What's something you're still figuring out about yourself?",
      "Who has had the biggest influence on who you are today?",
      "What's a risk you took that paid off?",
      "What's something you'd do differently if you could go back 5 years?"
    ],
    "couples": [
      "What's your favorite memory of us so far?",
      "What made you realize you wanted to be with me?",
      "What's something about our relationship you're most grateful for?",
      "What's a dream you have for our future together?",
      "What's something I do that makes you feel most loved?",
      "What's a little quirk of mine that you secretly adore?"
    ],
    "wild": [
      {
        "id": "wild_question_001",
        "text": "Who here looks the most innocent but probably is not?",
        "intensity": 2
      },
      {
        "id": "wild_question_002",
        "text": "Who here would be the best person to have as your wingman or wingwoman?",
        "intensity": 2
      },
      {
        "id": "wild_question_003",
        "text": "What is your most chaotic dating opinion?",
        "intensity": 3
      },
      {
        "id": "wild_question_004",
        "text": "What is one thing people call a red flag that you secretly find attractive?",
        "intensity": 3
      },
      {
        "id": "wild_question_005",
        "text": "Who here gives off main character energy?",
        "intensity": 2
      },
      {
        "id": "wild_question_006",
        "text": "What is the most dramatic thing you have done for attention?",
        "intensity": 3
      },
      {
        "id": "wild_question_007",
        "text": "What is one wild story you can tell without naming names?",
        "intensity": 3
      },
      {
        "id": "wild_question_008",
        "text": "Who here would be most likely to flirt their way out of trouble?",
        "intensity": 2
      },
      {
        "id": "wild_question_009",
        "text": "What is one thing you would only confess after midnight?",
        "intensity": 3
      },
      {
        "id": "wild_question_010",
        "text": "What is the funniest bad decision you almost made?",
        "intensity": 2
      },
      {
        "id": "wild_question_011",
        "text": "Who here would survive best in a reality dating show?",
        "intensity": 2
      },
      {
        "id": "wild_question_012",
        "text": "What is one thing that instantly makes a party better?",
        "intensity": 1
      },
      {
        "id": "wild_question_013",
        "text": "Who here would be the most dangerous person to text after two drinks?",
        "intensity": 3
      },
      {
        "id": "wild_question_014",
        "text": "What is one compliment you pretend does not work on you, but it does?",
        "intensity": 2
      },
      {
        "id": "wild_question_015",
        "text": "What is your most charming bad habit?",
        "intensity": 2
      }
    ],
    "spicy": [
      {
        "id": "spicy_question_001",
        "text": "What is the quickest way someone can make the room feel warmer without touching you?",
        "intensity": 2
      },
      {
        "id": "spicy_question_002",
        "text": "What is your favorite kind of non-verbal flirting?",
        "intensity": 2
      },
      {
        "id": "spicy_question_003",
        "text": "What is one compliment that would be dangerous if said by the right person?",
        "intensity": 3
      },
      {
        "id": "spicy_question_004",
        "text": "What body part do you think does not get enough appreciation?",
        "intensity": 3
      },
      {
        "id": "spicy_question_005",
        "text": "What kind of touch feels most romantic or exciting to you?",
        "intensity": 3
      },
      {
        "id": "spicy_question_006",
        "text": "What clothing item or outfit always gets your attention?",
        "intensity": 3
      },
      {
        "id": "spicy_question_007",
        "text": "What kind of kiss do you like most?",
        "intensity": 4
      },
      {
        "id": "spicy_question_008",
        "text": "Would you rather be kissed softly for a long time or kissed like someone could not wait anymore?",
        "intensity": 4
      },
      {
        "id": "spicy_question_009",
        "text": "What is one adult-only dare you would be open to with clear consent?",
        "intensity": 4
      },
      {
        "id": "spicy_question_010",
        "text": "What is one part of your body you feel most confident showing in the right private setting?",
        "intensity": 4
      },
      {
        "id": "spicy_question_011",
        "text": "What is more attractive: confidence, eye contact, touch, or the right words?",
        "intensity": 3
      },
      {
        "id": "spicy_question_012",
        "text": "What is the difference between sexy and trying too hard?",
        "intensity": 3
      },
      {
        "id": "spicy_question_013",
        "text": "What kind of physical chemistry is impossible to fake?",
        "intensity": 4
      },
      {
        "id": "spicy_question_014",
        "text": "What is one clothing swap or clothing-removal dare you would actually consider in a private adults-only game?",
        "intensity": 4
      },
      {
        "id": "spicy_question_015",
        "text": "What is one boundary you want people to respect even in a spicy game?",
        "intensity": 2
      }
    ]
  }
};

function categoryAccent(id) {
  return CONTENT.categories.find((c) => c.id === id)?.accent || "#34D6B0";
}

function isAdultCategory(id) {
  return ADULT_CATEGORY_IDS.has(id);
}

function promptText(prompt) {
  return typeof prompt === "string" ? prompt : prompt?.text || "";
}

function encodePrompt(prompt) {
  return typeof prompt === "string" ? prompt : JSON.stringify(prompt);
}

function decodePrompt(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && parsed.text) return parsed;
  } catch (e) {
    // Plain text prompts from older rooms are still valid.
  }
  return { text: value };
}

function pickFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 4; i++)
    out += letters[Math.floor(Math.random() * letters.length)];
  return out;
}

function randomInviteToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 18; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function firstNameOnly(value) {
  return String(value || "").trim().split(/\s+/)[0]?.slice(0, 24) || "";
}

function pickTruthOrDare(room, kind) {
  const cat = CONTENT.categories.find((c) => c.id === room.category) || CONTENT.categories[0];
  const pool = kind === "truth" ? cat.truths : cat.dares;
  return pickFromPool(pool);
}

function inviteUrlFor(code, token) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", code);
  if (token) url.searchParams.set("invite", token);
  return url.toString();
}

function penaltyTextFor(kind) {
  const shotCount = kind === "dare" ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
  const label = kind === "dare" ? "Dare refused or failed" : "Challenge skipped";
  return `${label}: ${shotCount} ${shotCount === 1 ? "shot" : "shots"}. The group can swap for a house-rule penalty.`;
}

function shotCountFromPenalty(text) {
  const match = String(text || "").match(/: (\d+) shots?/i);
  return match ? Number(match[1]) : 0;
}

function isExpiredRoom(room) {
  if (!room?.created_at) return false;
  const ageMs = Date.now() - new Date(room.created_at).getTime();
  return ageMs > ROOM_TTL_HOURS * 60 * 60 * 1000;
}

function qrUrlFor(code, token) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(inviteUrlFor(code, token))}`;
}

// ---- Small UI atoms ----------------------------------------------------
function Button({ children, onClick, variant = "solid", accent = "#34D6B0", disabled, style }) {
  const base = {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.02em",
    padding: "16px 22px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "transform 0.15s ease, opacity 0.15s ease",
    width: "100%",
  };
  const variants = {
    solid: { background: accent, color: "#0B0B10" },
    outline: {
      background: "transparent",
      color: accent,
      border: `1.5px solid ${accent}`,
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "#E9E7F0",
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onPointerDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function TextField({ value, onChange, placeholder, maxLength, onEnter, autoFocus, center, ariaLabel, id }) {
  return (
    <input
      id={id}
      autoFocus={autoFocus}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
      placeholder={placeholder}
      aria-label={ariaLabel || placeholder}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "16px 18px",
        fontSize: center ? 22 : 16,
        fontFamily: center ? "'Sora', sans-serif" : "'Manrope', sans-serif",
        fontWeight: center ? 700 : 500,
        letterSpacing: center ? "0.12em" : "normal",
        textAlign: center ? "center" : "left",
        textTransform: center ? "uppercase" : "none",
        color: "#F4F2FA",
        boxSizing: "border-box",
      }}
    />
  );
}

// ---- Screens -------------------------------------------------------------

function HomeScreen({ onCreate, onJoin, onInstall, installStatus, canInstall }) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState("home"); // home | join

  return (
    <div style={screenWrap}>
      <div style={ambientStage}>
        <div style={heroCardBack} />
        <div style={heroCardMid} />
        <div style={heroCardFront}>
          <div style={heroCardMark}>?</div>
          <div style={heroCardRule}>TRUTH</div>
          <div style={heroCardRuleAlt}>DARE</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 24 }}>
        <div style={{ textAlign: "left", marginBottom: 32 }}>
          <div style={eyebrow}>PRIVATE PARTY GAME</div>
          <h1 style={heroTitle}>Afterparty</h1>
          <p style={heroCopy}>
            Truth, dares, penalties, invites, and host controls built for the phone in your hand.
          </p>
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Button accent="#34D6B0" onClick={onCreate}>
              Host a new room
            </Button>
            <Button variant="outline" accent="#E9E7F0" onClick={() => setMode("join")}>
              Join with a code
            </Button>
            <Button variant="ghost" onClick={onInstall}>
              {canInstall ? "Install app" : "How to install"}
            </Button>
            {installStatus && <div style={hintText}>{installStatus}</div>}
          </div>
        )}

        {mode === "join" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label
              htmlFor="join-code-input"
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9C97AE", letterSpacing: "0.08em", marginBottom: -4, fontFamily: "'Manrope', sans-serif" }}
            >
              ROOM CODE
            </label>
            <TextField
              id="join-code-input"
              value={joinCode}
              onChange={(v) => setJoinCode(v.toUpperCase().slice(0, 4))}
              placeholder="CODE"
              ariaLabel="4-letter room code"
              maxLength={4}
              center
              autoFocus
              onEnter={() => joinCode.length === 4 && onJoin(joinCode)}
            />
            <Button
              accent="#34D6B0"
              disabled={joinCode.length !== 4}
              onClick={() => onJoin(joinCode)}
            >
              Continue
            </Button>
            <Button variant="ghost" onClick={() => setMode("home")}>
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
function ConfigScreen() {
  return (
    <div style={screenWrap}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div style={eyebrow}>SUPABASE CONFIG REQUIRED</div>
        <h1 style={heroTitle}>
          Afterparty
        </h1>
        <p style={{ color: "#D8D3E6", fontSize: 15, lineHeight: 1.55, fontFamily: "'Manrope', sans-serif", margin: 0 }}>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the existing demo Supabase project before running or deploying this branch.
        </p>
      </div>
    </div>
  );
}

function CreateRoomScreen({ onRoomCreated, onBack }) {
  const [name, setName] = useState("");
  const [gameMode, setGameMode] = useState("truth_dare");
  const [category, setCategory] = useState("mild");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const needsAgeGate = true;

  async function handleCreate() {
    if (!name.trim()) return;
    if (needsAgeGate && !ageConfirmed) {
      setError("Confirm everyone is 21+ and consents to adult-only content before creating this room.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let code = randomCode();
      // Try a few times in case of collision
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: existing } = await supabase.from("rooms").select("code").eq("code", code).maybeSingle();
        if (!existing) break;
        code = randomCode();
      }
      const { error: roomErr } = await supabase.from("rooms").insert({
        code,
        game_mode: gameMode,
        category,
        status: "lobby",
        current_player_index: 0,
      });
      if (roomErr) throw roomErr;

      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ room_code: code, name: name.trim(), join_order: 0 })
        .select()
        .single();
      if (playerErr) throw playerErr;

      onRoomCreated(code, player);
    } catch (e) {
      setError("Couldn't create the room. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div style={screenWrap}>
      <button onClick={onBack} style={backBtn}>← Back</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div>
          <div style={eyebrow}>STEP 1 OF 1</div>
          <h2 style={sectionTitle}>Set up the room</h2>
        </div>

        <Field label="Your name" htmlFor="create-name">
          <TextField id="create-name" value={name} onChange={setName} placeholder="What should we call you?" autoFocus maxLength={20} />
        </Field>

        <Field label="Game mode">
          <SegmentedControl
            options={[
              { id: "truth_dare", label: "Truth or Dare" },
              { id: "questions", label: "Questions" },
            ]}
            value={gameMode}
            onChange={setGameMode}
          />
        </Field>

        <Field label="Category">
          <div style={{ display: "flex", gap: 10 }}>
            {CONTENT.categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.label.split(" / ")[0]}
                accent={c.accent}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </div>
        </Field>

        {needsAgeGate && (
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(event) => setAgeConfirmed(event.target.checked)}
            />
            <span>
              21+ only. Everyone can say no, stop any dare, and choose a non-alcoholic substitute.
            </span>
          </label>
        )}

        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}

        <Button accent={categoryAccent(category)} disabled={!name.trim() || (needsAgeGate && !ageConfirmed) || busy} onClick={handleCreate}>
          {busy ? "Creating..." : "Create room"}
        </Button>
      </div>
    </div>
  );
}

function JoinRoomScreen({ code, inviteToken, onJoined, onBack }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;
    let active = true;

    async function loadInviteLabel() {
      const { data } = await supabase
        .from("room_invites")
        .select("invitee_name")
        .eq("room_code", code)
        .eq("token", inviteToken)
        .maybeSingle();
      if (!active || !data) return;
      const firstName = firstNameOnly(data.invitee_name);
      setInviteLabel(firstName);
      if (firstName) setName(firstName);
    }

    loadInviteLabel();
    return () => {
      active = false;
    };
  }, [code, inviteToken]);

  async function handleJoin() {
    if ((!name.trim() && !inviteToken) || !ageConfirmed) return;
    setBusy(true);
    setError("");
    try {
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (roomErr || !room) {
        setError("Room not found. Double check the code.");
        setBusy(false);
        return;
      }
      if (isExpiredRoom(room)) {
        setError(`That room expired after ${ROOM_TTL_HOURS} hours. Ask the host to create a new room.`);
        setBusy(false);
        return;
      }
      let invite = null;
      if (inviteToken) {
        const { data: inviteRow, error: inviteErr } = await supabase
          .from("room_invites")
          .select("*")
          .eq("room_code", code)
          .eq("token", inviteToken)
          .maybeSingle();
        if (inviteErr) {
          setError("Invite tracking is not enabled yet. Ask the host to share the room code.");
          setBusy(false);
          return;
        }
        if (!inviteRow) {
          setError("This invite is no longer available. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        if (inviteRow.status === "canceled") {
          setError("This invite was canceled. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        if (inviteRow.status === "used" && inviteRow.used_by) {
          const { data: existingPlayer } = await supabase
            .from("players")
            .select("*")
            .eq("id", inviteRow.used_by)
            .maybeSingle();
          if (existingPlayer) {
            onJoined(code, existingPlayer);
            return;
          }
        }
        if (inviteRow.status !== "pending") {
          setError("This invite is no longer available. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        invite = inviteRow;
      }
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", code)
        .order("join_order", { ascending: true });
      const roster = existingPlayers || [];
      if (roster.length >= MAX_PLAYERS) {
        setError(`This room is full at ${MAX_PLAYERS} players.`);
        setBusy(false);
        return;
      }
      const joinName = invite?.invitee_name ? firstNameOnly(invite.invitee_name) : firstNameOnly(name);
      if (roster.some((player) => player.name.trim().toLowerCase() === joinName.toLowerCase())) {
        setError("That name is already in the room. Add an initial or nickname.");
        setBusy(false);
        return;
      }

      const nextOrder = roster.length;
      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ room_code: code, name: joinName, join_order: nextOrder })
        .select()
        .single();
      if (playerErr) throw playerErr;
      if (invite?.id) {
        await supabase
          .from("room_invites")
          .update({ status: "used", used_at: new Date().toISOString(), used_by: player.id })
          .eq("id", invite.id);
      }

      onJoined(code, player);
    } catch (e) {
      setError("Something went wrong joining the room.");
      setBusy(false);
    }
  }

  return (
    <div style={screenWrap}>
      <button onClick={onBack} style={backBtn}>← Back</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
        <div>
          <div style={eyebrow}>JOINING ROOM {code}</div>
          <h2 style={sectionTitle}>{inviteLabel ? `Welcome, ${inviteLabel}` : "What's your name?"}</h2>
        </div>
        <Field label="Your name" htmlFor="join-name">
          <TextField id="join-name" value={name} onChange={setName} placeholder="Your first name" autoFocus maxLength={20} onEnter={handleJoin} />
        </Field>
        <label style={checkRow}>
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(event) => setAgeConfirmed(event.target.checked)}
          />
          <span>
            I am 21+ and understand consent is required for every adult prompt.
          </span>
        </label>
        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}
        <Button accent="#34D6B0" disabled={(!name.trim() && !inviteToken) || !ageConfirmed || busy} onClick={handleJoin}>
          {busy ? "Joining..." : "Join room"}
        </Button>
      </div>
    </div>
  );
}

function LobbyScreen({
  room,
  players,
  me,
  online,
  pendingInvites,
  invitesSupported,
  onStart,
  onLeave,
  onInvite,
  onCancelInvite,
  onCopyInvite,
  inviteStatus,
  onRoomSettingsChange,
  onRemovePlayer,
  onTransferHost,
}) {
  const isHost = players.length > 0 && players[0].id === me.id;
  const cat = CONTENT.categories.find((c) => c.id === room.category);
  const latestPendingInvite = pendingInvites[0];
  const inviteUrl = inviteUrlFor(room.code, latestPendingInvite?.token);
  const [inviteeName, setInviteeName] = useState("");
  const [adultSettingsConfirmed, setAdultSettingsConfirmed] = useState(false);

  return (
    <div style={screenWrap}>
      <button onClick={onLeave} style={backBtn}>← Leave</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }}>
          <div style={eyebrow}>ROOM CODE</div>
          <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: "0.08em", color: cat?.accent }}>
            {room.code}
          </div>
          <p style={{ color: "#9C97AE", fontSize: 14, marginTop: 6, fontFamily: "'Manrope', sans-serif" }}>
            Share this code so others can join
          </p>
          <Pill text={online ? "Connected" : "Offline - reconnecting"} accent={online ? "#34D6B0" : "#FFB84D"} />
        </div>

        <div>
          <div style={{ ...eyebrow, marginBottom: 12 }}>
            PLAYERS · {players.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {players.map((p, i) => (
              <div key={p.id} style={playerRow}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}>
                  {p.name} {p.id === me.id && <span style={{ color: "#9C97AE" }}>(you)</span>}
                </span>
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {i === 0 && <span style={{ ...badge, background: cat?.accent }}>HOST</span>}
                  {isHost && p.id !== me.id && (
                    <>
                      <button onClick={() => onTransferHost(p)} style={miniBtn}>Make host</button>
                      <button onClick={() => onRemovePlayer(p)} style={miniBtn}>Remove</button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Pill text={room.game_mode === "questions" ? "Questions" : "Truth or Dare"} />
          <Pill text={cat?.label} accent={cat?.accent} />
        </div>

        {isHost && (
          <TextField
            value={inviteeName}
            onChange={(value) => setInviteeName(firstNameOnly(value))}
            placeholder="Invitee name"
            maxLength={24}
            ariaLabel="Invitee name"
          />
        )}
        <Button
          variant="ghost"
          disabled={isHost && !firstNameOnly(inviteeName)}
          onClick={() => {
            onInvite(inviteeName);
            setInviteeName("");
          }}
        >
          Create invite
        </Button>
        <div style={qrPanel}>
          <img src={qrUrlFor(room.code, latestPendingInvite?.token)} alt={`QR invite for room ${room.code}`} style={qrImage} />
          <div style={{ ...hintText, textAlign: "left" }}>
            {latestPendingInvite ? "Latest pending invite:" : "Create an invite to generate a cancelable link:"}
            <div style={linkText}>{inviteUrl}</div>
          </div>
        </div>
        {inviteStatus && <div style={hintText}>{inviteStatus}</div>}
        {isHost && (
          <div style={invitePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>PENDING INVITES</div>
            {!invitesSupported && (
              <div style={{ ...hintText, textAlign: "left" }}>
                Run the invite SQL migration to enable pending invite tracking.
              </div>
            )}
            {invitesSupported && pendingInvites.length === 0 && (
              <div style={{ ...hintText, textAlign: "left" }}>No pending invites.</div>
            )}
            {pendingInvites.map((invite) => (
              <div key={invite.id} style={inviteRow}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13 }}>
                    {firstNameOnly(invite.invitee_name)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
                  <button onClick={() => onCopyInvite(invite)} style={miniBtn}>Copy</button>
                  <button onClick={() => onCancelInvite(invite)} style={miniBtn}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isHost && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Game mode">
              <SegmentedControl
                options={[
                  { id: "truth_dare", label: "Truth or Dare" },
                  { id: "questions", label: "Questions" },
                ]}
                value={room.game_mode}
                onChange={(value) => onRoomSettingsChange({ game_mode: value })}
              />
            </Field>
            <Field label="Category">
              <div style={{ display: "flex", gap: 10 }}>
                {CONTENT.categories.map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.label.split(" / ")[0]}
                    accent={c.accent}
                    active={room.category === c.id}
                    onClick={() => {
                      if (isAdultCategory(c.id) && !adultSettingsConfirmed) return;
                      onRoomSettingsChange({ category: c.id });
                    }}
                  />
                ))}
              </div>
            </Field>
            <label style={checkRow}>
              <input
                type="checkbox"
                checked={adultSettingsConfirmed}
                onChange={(event) => setAdultSettingsConfirmed(event.target.checked)}
              />
              <span>
                Unlock 21+ packs. Ask once, accept no, and allow non-alcoholic substitutes.
              </span>
            </label>
          </div>
        )}

        {isHost ? (
          <Button accent={cat?.accent} disabled={players.length < 2} onClick={onStart}>
            {players.length < 2 ? "Waiting for more players..." : "Start game"}
          </Button>
        ) : (
          <div style={{ textAlign: "center", color: "#9C97AE", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>
            Waiting for the host to start...
          </div>
        )}
      </div>
    </div>
  );
}

function GameScreen({
  room,
  players,
  me,
  online,
  score,
  onAction,
  onLeave,
  onInvite,
  onEndGame,
  onSkipPlayer,
  onRemovePlayer,
  onShareRecap,
  inviteStatus,
  busy,
}) {
  const cat = CONTENT.categories.find((c) => c.id === room.category);
  const currentPlayer = players[room.current_player_index % players.length];
  const isMyTurn = currentPlayer?.id === me.id;
  const hasPrompt = !!room.current_prompt;
  const isPenalty = room.current_type === "penalty";
  const isPenaltyLike = room.current_type === "penalty" || room.current_type === "consequence";
  const isHost = players.length > 0 && players[0].id === me.id;
  const currentPrompt = decodePrompt(room.current_prompt);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
    if (hasPrompt) {
      const t = setTimeout(() => setFlipped(true), 60);
      return () => clearTimeout(t);
    }
  }, [room.current_prompt, room.current_type]);

  const accent = cat?.accent || "#34D6B0";

  return (
    <div style={screenWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button onClick={onLeave} style={backBtn}>Leave</button>
        <button onClick={onInvite} style={backBtn}>Invite</button>
      </div>

      <div style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }}>
        <Pill text={room.game_mode === "questions" ? "Questions" : "Truth or Dare"} />
        <Pill text={cat?.label} accent={accent} style={{ marginLeft: 8 }} />
        <Pill text={online ? "Connected" : "Offline - reconnecting"} accent={online ? "#34D6B0" : "#FFB84D"} style={{ marginLeft: 8 }} />
      </div>
      {inviteStatus && <div style={hintText}>{inviteStatus}</div>}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }} aria-live="polite">
          <div style={eyebrow}>{isMyTurn ? "YOUR TURN" : "CURRENT TURN"}</div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: accent }}>
            {currentPlayer?.name}
          </div>
        </div>

        <div style={{ perspective: 1200, width: "100%", maxWidth: 360, height: 300 }} role="region" aria-label="Current prompt card">
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 22,
              position: "relative",
              transformStyle: "preserve-3d",
              transition: "transform 0.55s cubic-bezier(.2,.8,.2,1)",
              transform: flipped ? "rotateY(0deg)" : "rotateY(90deg)",
            }}
          >
            <div
              aria-live="assertive"
              aria-atomic="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: hasPrompt ? `linear-gradient(155deg, ${accent}22, rgba(255,255,255,0.04))` : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${hasPrompt ? accent + "55" : "rgba(255,255,255,0.1)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 28,
                textAlign: "center",
              }}
            >
              {hasPrompt ? (
                <div>
                  <div style={{ ...eyebrow, color: accent, marginBottom: 10 }}>
                    {room.current_type === "consequence" ? "RIGHT-SIDE CONSEQUENCE" : isPenalty ? "PENALTY" : room.current_type?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", lineHeight: 1.35, color: "#F4F2FA" }}>
                    {promptText(currentPrompt)}
                  </div>
                  {currentPrompt?.penalty?.count && (
                    <div style={promptMetaLine}>
                      Penalty: {currentPrompt.penalty.count} {currentPrompt.penalty.count === 1 ? "shot" : "shots"}
                    </div>
                  )}
                  {currentPrompt?.warning && (
                    <div style={{ ...promptMetaLine, color: "#FFB84D" }}>
                      {currentPrompt.warning}
                    </div>
                  )}
                  {currentPrompt?.consequence && (
                    <div style={promptMetaLine}>
                      No extra alcohol. No forced touching, kissing, exposure, recording, or humiliation.
                    </div>
                  )}
                  {currentPrompt?.requires_consent && (
                    <div style={promptMetaLine}>
                      Ask once. If they say no, move on. You take the penalty.
                    </div>
                  )}
                  {(currentPrompt?.requires_self_consent || currentPrompt?.adult_body_reveal || currentPrompt?.clothing_removal) && (
                    <div style={promptMetaLine}>
                      You choose what you consent to. No one else chooses for you.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "#807C92", fontFamily: "'Manrope', sans-serif", fontSize: 15 }}>
                  {isMyTurn ? "Pick truth or dare below" : "Waiting for their pick..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: 18 }}>
        {isAdultCategory(room.category) && (
          <div style={{ ...hintText, marginBottom: 10 }}>
            21+ only. Say no without penalty. Water, soda, or any non-alcoholic drink can replace shots.
          </div>
        )}
        {isMyTurn && !hasPrompt && room.game_mode === "truth_dare" && (
          <div style={{ display: "flex", gap: 12 }}>
            <Button accent="#34D6B0" disabled={busy} onClick={() => onAction("draw", "truth")}>Truth</Button>
            <Button accent="#FF5A4E" disabled={busy} onClick={() => onAction("draw", "dare")}>Dare</Button>
          </div>
        )}
        {isMyTurn && !hasPrompt && room.game_mode === "questions" && (
          <Button accent={accent} disabled={busy} onClick={() => onAction("draw", "question")}>Draw a question</Button>
        )}
        {isMyTurn && hasPrompt && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!isPenaltyLike && (
              <Button variant="outline" accent="#FFB84D" disabled={busy} onClick={() => onAction("penalty")}>
                Refused / failed
              </Button>
            )}
            <Button accent={accent} disabled={busy} onClick={() => onAction("next")}>Done - next player</Button>
          </div>
        )}
        {!isMyTurn && (
          <div style={{ textAlign: "center", color: "#807C92", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>
            {currentPlayer?.name} is up
          </div>
        )}
        {isHost && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="ghost" disabled={busy} onClick={onSkipPlayer}>Skip player</Button>
              <Button variant="ghost" disabled={busy || !currentPlayer || currentPlayer.id === me.id} onClick={() => onRemovePlayer(currentPlayer)}>Remove player</Button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="ghost" disabled={busy} onClick={onShareRecap}>Share recap</Button>
              <Button variant="ghost" disabled={busy} onClick={onEndGame}>End game</Button>
            </div>
          </div>
        )}
        {score.length > 0 && (
          <div style={scorePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>PENALTIES</div>
            {score.slice(0, 4).map((entry) => (
              <div key={entry.name} style={scoreRow}>
                <span>{entry.name}</span>
                <span>{entry.shots} shots</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Small reusable pieces -----------------------------------------------

function Field({ label, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9C97AE", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Manrope', sans-serif" }}
      >
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 4 }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          style={{
            flex: 1,
            padding: "12px 10px",
            borderRadius: 11,
            border: "none",
            background: value === opt.id ? "#F4F2FA" : "transparent",
            color: value === opt.id ? "#0B0B10" : "#9C97AE",
            fontWeight: 700,
            fontSize: 13.5,
            fontFamily: "'Manrope', sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CategoryChip({ label, accent, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        padding: "12px 8px",
        borderRadius: 13,
        border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
        background: active ? accent + "1f" : "transparent",
        color: active ? accent : "#9C97AE",
        fontWeight: 700,
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function Pill({ text, accent = "#9C97AE", style }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 14px",
        borderRadius: 999,
        background: accent + "1f",
        color: accent,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontFamily: "'Manrope', sans-serif",
        ...style,
      }}
    >
      {text}
    </span>
  );
}

const hintText = {
  textAlign: "center",
  color: "#9C97AE",
  fontSize: 13,
  lineHeight: 1.45,
  fontFamily: "'Manrope', sans-serif",
};

const promptMetaLine = {
  marginTop: 10,
  color: "#D8D3E6",
  fontSize: 12,
  lineHeight: 1.35,
  fontFamily: "'Manrope', sans-serif",
};

const checkRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  color: "#D8D3E6",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 13,
  lineHeight: 1.4,
};

// ---- Layout tokens --------------------------------------------------------

const screenWrap = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 25% 10%, #263044 0, #11131E 34%, #07070B 100%)",
  color: "#F4F2FA",
  padding: "24px 22px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: 480,
  margin: "0 auto",
};

const eyebrow = {
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.18em",
  color: "#807C92",
  fontFamily: "'Manrope', sans-serif",
  marginBottom: 6,
};

const heroTitle = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  fontSize: 58,
  letterSpacing: "0",
  margin: 0,
  lineHeight: 0.96,
  color: "#F8F3E8",
};

const heroCopy = {
  color: "#CFC8DD",
  fontSize: 15,
  lineHeight: 1.55,
  marginTop: 14,
  fontFamily: "'Manrope', sans-serif",
};

const ambientStage = {
  position: "relative",
  height: 250,
  margin: "18px 0 28px",
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(150deg, rgba(52,214,176,0.16), rgba(255,90,78,0.18) 48%, rgba(255,184,77,0.14))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
};

const heroCardBase = {
  position: "absolute",
  width: 150,
  height: 205,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 24px 45px rgba(0,0,0,0.38)",
};

const heroCardBack = {
  ...heroCardBase,
  right: 42,
  top: 30,
  transform: "rotate(15deg)",
  background: "linear-gradient(160deg, #33215A, #10131F)",
};

const heroCardMid = {
  ...heroCardBase,
  right: 105,
  top: 24,
  transform: "rotate(-12deg)",
  background: "linear-gradient(160deg, #173E39, #0D111C)",
};

const heroCardFront = {
  ...heroCardBase,
  left: 32,
  top: 22,
  background: "linear-gradient(160deg, #F8F3E8, #D8C7A0)",
  color: "#0B0B10",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 18,
  boxSizing: "border-box",
};

const heroCardMark = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 58,
  fontWeight: 800,
  lineHeight: 1,
};

const heroCardRule = {
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const heroCardRuleAlt = {
  ...heroCardRule,
  alignSelf: "flex-end",
  color: "#B33A33",
};

const sectionTitle = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  margin: "4px 0 0",
};

const backBtn = {
  background: "none",
  border: "none",
  color: "#9C97AE",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  padding: 0,
  alignSelf: "flex-start",
};

const playerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.05)",
  borderRadius: 12,
  padding: "12px 16px",
};

const badge = {
  fontSize: 10,
  fontWeight: 800,
  color: "#0B0B10",
  padding: "3px 8px",
  borderRadius: 999,
  letterSpacing: "0.05em",
};

const miniBtn = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 9,
  color: "#E9E7F0",
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  padding: "6px 8px",
};

const qrPanel = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const qrImage = {
  width: 92,
  height: 92,
  borderRadius: 10,
  background: "#F4F2FA",
  flex: "0 0 auto",
};

const linkText = {
  marginTop: 6,
  color: "#F4F2FA",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const mutedSmallText = {
  color: "#9C97AE",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  lineHeight: 1.35,
};

const scorePanel = {
  marginTop: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const scoreRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#E9E7F0",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  padding: "4px 0",
};

const invitePanel = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const inviteRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: "10px 0",
};

// ---- Root app ---------------------------------------------------------

export default function App() {
  const [view, setView] = useState("home"); // home | create | join | lobby | game
  const [joinCode, setJoinCode] = useState(null);
  const [inviteToken, setInviteToken] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [me, setMe] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installStatus, setInstallStatus] = useState("");
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [activityLog, setActivityLog] = useState([]);
  const [roundPenaltyCounts, setRoundPenaltyCounts] = useState({});
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesSupported, setInvitesSupported] = useState(true);

  // Restore session on mount (handles phone lock / tab reload mid-game)
  useEffect(() => {
    try {
      const invitedRoom = new URLSearchParams(window.location.search).get("room");
      if (invitedRoom) {
        const token = new URLSearchParams(window.location.search).get("invite");
        setJoinCode(invitedRoom.toUpperCase().slice(0, 4));
        setInviteToken(token);
        setView("join");
        return;
      }
      const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { roomCode: savedRoom, me: savedMe } = JSON.parse(saved);
        if (savedRoom && savedMe) {
          setRoomCode(savedRoom);
          setMe(savedMe);
        }
      }
    } catch (e) {
      // sessionStorage unavailable - proceed without persistence
    }
  }, []);

  // Save session whenever it changes
  useEffect(() => {
    if (roomCode && me) {
      try {
        const session = JSON.stringify({ roomCode, me });
        localStorage.setItem(SESSION_KEY, session);
        sessionStorage.setItem(SESSION_KEY, session);
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [roomCode, me]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallStatus("Install this app on your home screen for quick room re-entry.");
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setInstallStatus("Installed. Open it from your home screen any time.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load fonts once
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Subscribe to room + players once we have a roomCode
  useEffect(() => {
    if (!roomCode || !supabase) return;

    let active = true;

    async function loadInitial() {
      const { data: r } = await supabase.from("rooms").select("*").eq("code", roomCode).maybeSingle();
      const { data: p } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", roomCode)
        .order("join_order", { ascending: true });
      if (!active) return;
      if (!r) {
        handleLocalExit();
        setInstallStatus("That saved room is no longer available. Create or join a new room.");
        return;
      }
      if (isExpiredRoom(r)) {
        handleLocalExit();
        setInstallStatus(`That room expired after ${ROOM_TTL_HOURS} hours. Create a new one to keep playing.`);
        return;
      }
      setRoom(r);
      setPlayers(p || []);
      if (r?.status === "playing") setView("game");
      else setView("lobby");
    }
    loadInitial();

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` }, (payload) => {
        if (payload.eventType === "DELETE") return;
        setRoom(payload.new);
        if (payload.new.status === "playing") setView("game");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` }, () => {
        supabase
          .from("players")
          .select("*")
          .eq("room_code", roomCode)
          .order("join_order", { ascending: true })
          .then(({ data }) => setPlayers(data || []));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || !supabase) {
      setPendingInvites([]);
      return;
    }

    let active = true;

    async function loadInvites() {
      const { data, error } = await supabase
        .from("room_invites")
        .select("*")
        .eq("room_code", roomCode)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setInvitesSupported(false);
        setPendingInvites([]);
        return;
      }
      setInvitesSupported(true);
      setPendingInvites(data || []);
    }

    loadInvites();

    const channel = supabase
      .channel(`room-invites-${roomCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_invites", filter: `room_code=eq.${roomCode}` }, loadInvites)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) {
      setActivityLog([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`td_activity_${roomCode}`);
      setActivityLog(saved ? JSON.parse(saved) : []);
      const savedCounts = localStorage.getItem(`td_round_penalties_${roomCode}`);
      setRoundPenaltyCounts(savedCounts ? JSON.parse(savedCounts) : {});
    } catch (e) {
      setActivityLog([]);
      setRoundPenaltyCounts({});
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    try {
      localStorage.setItem(`td_activity_${roomCode}`, JSON.stringify(activityLog.slice(0, 30)));
    } catch (e) {
      // ignore storage errors
    }
  }, [activityLog, roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    try {
      localStorage.setItem(`td_round_penalties_${roomCode}`, JSON.stringify(roundPenaltyCounts));
    } catch (e) {
      // ignore storage errors
    }
  }, [roundPenaltyCounts, roomCode]);

  const penaltyScore = activityLog
    .filter((entry) => entry.type === "penalty")
    .reduce((acc, entry) => {
      acc[entry.player] = (acc[entry.player] || 0) + entry.shots;
      return acc;
    }, {});
  const score = Object.entries(penaltyScore)
    .map(([name, shots]) => ({ name, shots }))
    .sort((a, b) => b.shots - a.shots);

  function handleRoomCreated(code, player) {
    setMe(player);
    setRoomCode(code);
  }

  function handleJoined(code, player) {
    setMe(player);
    setRoomCode(code);
    setInviteToken(null);
  }

  async function handleStart() {
    setRoundPenaltyCounts({});
    await supabase
      .from("rooms")
      .update({ status: "playing", current_player_index: 0, current_prompt: null, current_type: null })
      .eq("code", roomCode);
  }

  async function handleEndGame() {
    if (actionInFlight) return;
    setActionInFlight(true);
    try {
      await supabase
        .from("rooms")
        .update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })
        .eq("code", roomCode);
      setView("lobby");
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleRoomSettingsChange(nextSettings) {
    if (!roomCode) return;
    await supabase
      .from("rooms")
      .update({ ...nextSettings, current_prompt: null, current_type: null, current_player_index: 0 })
      .eq("code", roomCode);
  }

  async function handleInvite(inviteeName = "") {
    if (!roomCode) return;
    let token = randomInviteToken();
    let label = firstNameOnly(inviteeName);
    if (!label) {
      label = firstNameOnly(window.prompt("Invitee first name") || "");
    }
    if (!label) {
      setInviteStatus("Enter an invitee first name before creating an invite.");
      return;
    }
    if (invitesSupported) {
      const { data, error } = await supabase
        .from("room_invites")
        .insert({ room_code: roomCode, token, invitee_name: label || null, created_by: me?.id || null })
        .select()
        .single();
      if (error) {
        setInvitesSupported(false);
        setInviteStatus("Invite tracking is not enabled yet. Sharing the room code link instead.");
        token = null;
      } else {
        token = data.token;
        setPendingInvites((invites) => [data, ...invites]);
      }
    }
    const url = inviteUrlFor(roomCode, token);
    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Truth/Dare room", text, url });
        setInviteStatus(token ? "Pending invite created and share sheet opened." : "Room link share sheet opened.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus(token ? "Pending invite created and link copied." : "Room link copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleCancelInvite(invite) {
    if (!invite?.id) return;
    const { error } = await supabase
      .from("room_invites")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("id", invite.id)
      .eq("status", "pending");
    if (error) {
      setInviteStatus("Couldn't cancel that invite. Check the invite SQL migration.");
      return;
    }
    setPendingInvites((invites) => invites.filter((item) => item.id !== invite.id));
    setInviteStatus("Invite canceled.");
  }

  async function handleCopyInvite(invite) {
    const url = inviteUrlFor(roomCode, invite?.token);
    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus("Invite link copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleRemovePlayer(player) {
    if (!player || actionInFlight) return;
    setActionInFlight(true);
    try {
      await supabase.from("players").delete().eq("id", player.id);
      if (player.id === me?.id) {
        handleLocalExit();
        return;
      }
      if (players.length <= 2) {
        await supabase
          .from("rooms")
          .update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })
          .eq("code", roomCode);
        return;
      }
      const currentIndex = room.current_player_index % players.length;
      const removedIndex = players.findIndex((p) => p.id === player.id);
      if (removedIndex > -1 && removedIndex <= currentIndex) {
        await supabase
          .from("rooms")
          .update({ current_player_index: Math.max(0, currentIndex - 1), current_prompt: null, current_type: null })
          .eq("code", roomCode);
      }
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleTransferHost(player) {
    if (!player || actionInFlight) return;
    setActionInFlight(true);
    try {
      const updates = players.map((p, index) => {
        const joinOrder = p.id === player.id ? -1 : index + 1;
        return supabase.from("players").update({ join_order: joinOrder }).eq("id", p.id);
      });
      await Promise.all(updates);
      await supabase
        .from("rooms")
        .update({ current_prompt: null, current_type: null })
        .eq("code", roomCode);
      setInviteStatus(`${player.name} is now host.`);
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleSkipPlayer() {
    if (!players.length) return;
    await handleAction("next");
  }

  async function handleShareRecap() {
    const lines = [
      `Truth/Dare room ${roomCode} recap`,
      `Players: ${players.map((player) => player.name).join(", ") || "None"}`,
      score.length ? `Penalties: ${score.map((entry) => `${entry.name} ${entry.shots}`).join(", ")}` : "Penalties: none",
      `Invite: ${inviteUrlFor(roomCode)}`,
    ];
    const text = lines.join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Truth/Dare recap", text });
        setInviteStatus("Recap shared.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus("Recap copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setInstallStatus(choice.outcome === "accepted" ? "Installing..." : "Install dismissed. You can try again later.");
      return;
    }

    setInstallStatus("On iPhone: Share, then Add to Home Screen. On Android: browser menu, then Install app.");
  }

  async function handleAction(action, kind) {
    if (actionInFlight) return; // guard against rapid double-tap firing duplicate writes
    setActionInFlight(true);
    try {
      if (action === "draw") {
        // Only succeeds if the room is still in the state we expect (no prompt drawn yet).
        // Prevents a double-tap from drawing two prompts in a row.
        const prompt = room.game_mode === "questions" ? pickTruthOrDareForQuestions() : pickTruthOrDare(room, kind);
        await supabase
          .from("rooms")
          .update({ current_prompt: encodePrompt(prompt), current_type: kind })
          .eq("code", roomCode)
          .is("current_prompt", null);
      } else if (action === "penalty") {
        const activePlayer = players[room.current_player_index % players.length];
        const playerId = activePlayer?.id || currentPlayerName();
        const currentCount = roundPenaltyCounts[playerId] || 0;
        const prompt = decodePrompt(room.current_prompt);
        const shotCount = prompt?.penalty?.count || shotCountFromPenalty(penaltyTextFor(room.current_type)) || 1;
        const isFourthPenalty = currentCount >= MAX_ROUND_SHOT_PENALTIES;
        const rightSidePlayer = players[(room.current_player_index + 1) % players.length];
        const penaltyPrompt = isFourthPenalty
          ? {
              text: `You have reached ${MAX_ROUND_SHOT_PENALTIES} penalties this round. ${rightSidePlayer?.name || "The player to your right"} now assigns a consent-safe consequence.`,
              consequence: true,
              rules: CONTENT.globalRules.penalty_tracking?.on_fourth_penalty?.rules || [],
            }
          : {
              text: `${currentPlayerName()} takes ${shotCount} ${shotCount === 1 ? "shot" : "shots"}.`,
              penalty: { type: "shots", count: shotCount },
              warning: currentCount + 1 === 2 ? `${currentPlayerName()} has 2 penalties this round.` : null,
            };
        await supabase
          .from("rooms")
          .update({ current_prompt: encodePrompt(penaltyPrompt), current_type: isFourthPenalty ? "consequence" : "penalty" })
          .eq("code", roomCode)
          .eq("current_player_index", room.current_player_index);
        if (!isFourthPenalty) {
          setRoundPenaltyCounts((counts) => ({ ...counts, [playerId]: currentCount + 1 }));
        }
        setActivityLog((entries) => [
          {
            type: isFourthPenalty ? "consequence" : "penalty",
            player: currentPlayerName(),
            shots: isFourthPenalty ? 0 : shotCount,
            text: penaltyPrompt.text,
            at: new Date().toISOString(),
          },
          ...entries,
        ].slice(0, 30));
      } else if (action === "next") {
        // Only succeeds if current_player_index still matches what this client saw.
        // Prevents a double-tap (or stale retry) from advancing the turn twice.
        const expectedIndex = room.current_player_index;
        const nextIndex = (expectedIndex + 1) % players.length;
        if (nextIndex === 0) setRoundPenaltyCounts({});
        await supabase
          .from("rooms")
          .update({ current_prompt: null, current_type: null, current_player_index: nextIndex })
          .eq("code", roomCode)
          .eq("current_player_index", expectedIndex);
      }
    } finally {
      setActionInFlight(false);
    }
  }

  function pickTruthOrDareForQuestions() {
    const pool = CONTENT.questionsMode[room.category] || CONTENT.questionsMode.mild;
    return pickFromPool(pool);
  }

  function currentPlayerName() {
    return players[room.current_player_index % players.length]?.name || "Player";
  }

  function handleLocalExit() {
    setView("home");
    setRoomCode(null);
    setRoom(null);
    setPlayers([]);
    setMe(null);
    setInviteToken(null);
    setPendingInvites([]);
    setInviteStatus("");
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // ignore
    }
  }

  async function handleLeave() {
    const player = me;
    if (player?.id && supabase) {
      await handleRemovePlayer(player);
      return;
    }
    handleLocalExit();
  }

  if (!hasSupabaseConfig) {
    return <ConfigScreen />;
  }

  if (view === "home") {
    return (
      <HomeScreen
        onCreate={() => setView("create")}
        onJoin={(code) => {
          setJoinCode(code);
          setInviteToken(null);
          setView("join");
        }}
        onInstall={handleInstall}
        installStatus={installStatus}
        canInstall={Boolean(installPrompt)}
      />
    );
  }

  if (view === "create") {
    return <CreateRoomScreen onRoomCreated={handleRoomCreated} onBack={() => setView("home")} />;
  }

  if (view === "join") {
    return <JoinRoomScreen code={joinCode} inviteToken={inviteToken} onJoined={handleJoined} onBack={() => setView("home")} />;
  }

  if (view === "lobby" && room) {
    return (
      <LobbyScreen
        room={room}
        players={players}
        me={me}
        online={online}
        pendingInvites={pendingInvites}
        invitesSupported={invitesSupported}
        onStart={handleStart}
        onLeave={handleLeave}
        onInvite={handleInvite}
        onCancelInvite={handleCancelInvite}
        onCopyInvite={handleCopyInvite}
        inviteStatus={inviteStatus}
        onRoomSettingsChange={handleRoomSettingsChange}
        onRemovePlayer={handleRemovePlayer}
        onTransferHost={handleTransferHost}
      />
    );
  }

  if (view === "game" && room) {
    return (
      <GameScreen
        room={room}
        players={players}
        me={me}
        online={online}
        score={score}
        onAction={handleAction}
        onLeave={handleLeave}
        onInvite={handleInvite}
        onEndGame={handleEndGame}
        onSkipPlayer={handleSkipPlayer}
        onRemovePlayer={handleRemovePlayer}
        onShareRecap={handleShareRecap}
        inviteStatus={inviteStatus}
        busy={actionInFlight}
      />
    );
  }

  return (
    <div style={{ ...screenWrap, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#9C97AE", fontFamily: "'Manrope', sans-serif" }}>Loading...</div>
    </div>
  );
}


