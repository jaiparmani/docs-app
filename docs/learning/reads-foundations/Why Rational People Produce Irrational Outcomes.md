---
tags: [reads, foundations, game-theory, incentives]
---

# Why Rational People Produce Irrational Outcomes

<small>6 min read</small>

When you see a group of people producing an obviously bad collective result — a team that won't fix its shared tooling, an industry burning money on advertising that cancels out, a fishery collapsing while everyone involved watches it happen — the instinctive explanation is that somebody is being stupid or selfish.

Usually they aren't. Usually each person is making the choice that is genuinely best for them given what everyone else is doing, and the bad outcome emerges anyway. This is not a paradox. It's the central subject of game theory, and once you can see it, a lot of otherwise baffling human behaviour resolves into something predictable.

## The dilemma at the centre of everything

The canonical setup is the Prisoner's Dilemma, and it's worth walking through carefully rather than just name-dropping.

Two people are arrested and held separately. Each is offered the same deal: stay silent, or inform on the other. If both stay silent, the prosecution has a weak case and both get a light sentence — say one year each. If both inform, both get a moderate sentence — say three years each. But if one informs while the other stays silent, the informer walks free and the silent one takes the full five years.

Now reason from inside one prisoner's head. You don't know what the other will do, so consider both possibilities. If they stay silent, you get one year by staying silent, or zero by informing — informing is better. If they inform, you get five years by staying silent, or three by informing — informing is better again.

Whatever the other person does, informing leaves you better off. So you inform. And they, running the identical reasoning, inform too. You both get three years, when you could both have had one.

Notice what did *not* happen here. Nobody was irrational. Nobody miscalculated. Both players correctly identified their best move and both are worse off for it. The bad outcome is not a failure of reasoning — **it is what correct individual reasoning produces in this structure.**

## Stable does not mean good

That three-years-each outcome has a name: it's a **Nash equilibrium**, meaning no individual player can improve their own result by unilaterally changing strategy. If you alone switch to silence while the other informs, you go from three years to five. So you stay put. So does the other player. The situation is stable.

The word "equilibrium" carries a comfortable connotation that badly misleads people. An equilibrium is not a good state, or a fair state, or an efficient state. It is merely a state that nobody can escape *alone*. A market with entrenched sludge, a team stuck in a bad process everybody complains about, a peace held together by mutual fear — all can be perfectly stable equilibria that everybody dislikes.

This is why "why don't they just change it?" is so often the wrong question. The answer is usually that no individual *can* change it by themselves without personally getting worse off, which is a completely different problem from nobody wanting change.

## The version with many players

Scale the dilemma up and you get the **tragedy of the commons**, which is where most of the real damage happens.

A shared pasture supports a hundred grazing animals sustainably. Each of ten herders reasons: if I add one more animal, I capture the full benefit of that animal, while the cost of slightly overgrazing is spread across all ten of us. My share of the harm is a tenth of the damage; my share of the benefit is all of it. So I add an animal. Everyone reasons identically. The pasture collapses.

Once you have this shape in your head you find it everywhere. Fisheries where every boat's individually sensible catch adds up to a stock collapse. Aquifers drawn down by farmers who each rationally pump more. Traffic, where every driver's decision to take the car imposes a small cost on everyone else and a large benefit on themselves. Antibiotic resistance. Carbon emissions. The shared internal library at work that everybody uses, nobody owns, and which slowly rots because maintaining it costs one team their sprint while benefiting twelve.

In every case the structure is the same: **benefits concentrate on the actor, costs distribute across everyone.** Individually rational, collectively ruinous.

## Coordination problems are a different animal

It's worth separating out a category that looks similar and isn't, because the fixes are completely different.

In a cooperation problem, people's interests genuinely conflict — I'd prefer you cooperate while I defect. In a **coordination problem**, everybody wants the same outcome and simply can't get there.

Which side of the road to drive on is the purest example. Nobody has a preference between left and right in the abstract. Everybody desperately wants to be on the same side as everyone else. There's no temptation to defect — driving on the wrong side alone is suicidal, not advantageous. The only difficulty is arriving at a shared answer, and once one exists it holds effortlessly.

Standing at concerts is the everyday version. Everyone would prefer that everyone sits. But once the front row stands, everyone behind must stand to see, and now the whole room is standing with a worse view than when everyone sat. Nobody wanted this. Nobody benefits. It's a coordination failure, not a selfishness problem — which is why "the venue announces that everyone must remain seated" actually works, while it would do nothing at all for a genuine prisoner's dilemma.

The practical distinction: coordination problems are solved by **information and a focal point** — someone credibly announcing the answer. Cooperation problems need something stronger, because there's an actual incentive to cheat.

## What repetition changes

The prisoner's dilemma is bleak because it's played once by strangers who'll never meet again. Almost nothing in real life works that way.

When the same players interact repeatedly, defection stops being free. Betray a colleague today and you're dealing with them again next quarter, having taught them exactly what you are. The shadow of the future changes the arithmetic — a small gain now against a long stream of retaliation is a bad trade.

In tournaments where computer programs played iterated prisoner's dilemmas against each other, one of the most effective strategies turned out to be strikingly simple: cooperate on the first move, then do whatever your opponent did last time. It's forgiving enough to restore cooperation after a lapse, retaliatory enough that exploiting it doesn't pay, and transparent enough that opponents can figure out how to get a good outcome from it. Elaborate deception did not beat it.

This is the mechanism underneath reputation, and it's why so much human institutional design — credit ratings, references, reviews, professional licensing, repeat-business relationships — is fundamentally machinery for turning one-shot games into repeated ones.

## The question worth asking

The lasting value of all this isn't the terminology. It's a reflex.

When you encounter a persistently bad collective outcome, the unproductive question is "why are these people behaving so badly?" The productive one is: **what are the incentives that make this individually rational?**

Because if the answer is that each person is doing the sensible thing given their position, then appealing to people to be better will not work, and neither will replacing them — the new people will face the same structure and make the same choices. What has to change is the payoff structure itself: making the cost of defection land on the defector, making the shared resource someone's actual responsibility, converting a one-shot interaction into a repeated one, or simply making the good outcome the coordinated default.

The people were never the problem. The shape of the game was.
