---
tags: [reads, tech, linux, containers, systems, virtualization]
---

# What a Container Actually Isn't

<small>6 min read</small>

Ask most engineers to explain a Docker container and you'll get some version of "a lightweight VM" — smaller, faster to start, sharing more with the host, but fundamentally the same idea: an isolated little box running its own operating system. It's a useful enough lie to get someone through their first few months of using containers. It falls apart the moment you ask a question the metaphor can't answer, like why you can't run a Windows container on a bare Linux host no matter how you configure it, or why a single kernel vulnerability can let an attacker step out of one container and read the memory of every other container on the same machine. A VM doesn't have that failure mode. A container does, and the reason why is the actual mechanism, not a detail.

## What a VM actually virtualizes

Start with what a virtual machine really is, because the contrast is where the container's true nature shows up. A hypervisor virtualizes hardware — CPU, memory, disk, network interfaces — and each VM boots and runs its own complete operating system kernel on top of that virtual hardware. The VM genuinely believes it has its own machine, because in the ways that matter for an OS kernel, it does. That's why a Linux host can run a Windows VM: the hypervisor doesn't care what kernel the VM chooses to boot, it just hands out virtualized hardware and lets the guest kernel do whatever a kernel does. The isolation boundary sits below the kernel, enforced by the hypervisor and, on modern hardware, backed by CPU virtualization extensions.

## A container is a process wearing a disguise

A container has none of that. A container is a completely ordinary Linux process — it has a PID like any other process, it's scheduled by the same kernel scheduler as every other process on the box, and there is exactly one kernel involved: the host's. What makes it feel isolated is that the kernel has been told, at the moment that process starts, to give it a restricted view of the system using two mechanisms, and understanding both is the entire trick.

The first is namespaces, which control what the process can *see*. A PID namespace makes the process believe it's the first process on the system, unable to see or signal anything outside its namespace. A mount namespace gives it its own filesystem root — this is where container images actually live, usually assembled from layered filesystems via overlayfs, so the process sees what looks like a complete, separate root filesystem even though it's really a view constructed on top of the host's. A network namespace gives it its own network interfaces, routing table, and IP address, so it can bind to port 80 without conflicting with the host's own port 80. A UTS namespace gives it its own hostname. A user namespace can remap the container's notion of root (UID 0) to an unprivileged UID on the host, so that "root inside the container" doesn't mean root on the machine. None of this hides the kernel from the process — the process still makes the exact same system calls, into the exact same kernel, as anything else running on the host. It just gets a curated view of what exists.

The second mechanism is cgroups — control groups — which govern what the process can *use*: how much CPU time it's scheduled, how much memory it can allocate before the kernel's OOM killer terminates it, how much disk I/O bandwidth it gets, how many processes it's allowed to spawn. Namespaces answer "what can this process see," cgroups answer "what can this process use," and together they are what a container actually is. There's no third mechanism running a second kernel underneath. There's one kernel, doing bookkeeping.

## The consequences fall straight out of this

Once the mechanism is this precise, several things that seem like arbitrary platform limitations turn out to be logically forced.

A container can't run a different kernel than the host, ever, because it isn't running a kernel at all — it's a process making system calls into the host's kernel, and those calls have to match whatever kernel is actually there. When people run "Windows containers" on a Mac or a Linux machine via Docker Desktop, what's actually happening is a full Linux (or Windows) virtual machine is booted in the background using a real hypervisor, and the containers run inside that VM against its kernel. The container layer itself never crosses the kernel boundary — something has to, and that something is a VM, brought back in through the side door.

A kernel vulnerability breaks every container on the host simultaneously, not because containers are fragile but because there is exactly one enforcement point and it's shared. A bug in how the kernel handles namespaces, or a container-runtime escape like the class of vulnerabilities found in `runc` over the years, doesn't compromise "a container" — it compromises the referee that every container on that machine is trusting to keep them apart. Compare a hypervisor escape, which is rare precisely because the hardware-virtualization boundary is a much smaller, more heavily scrutinized attack surface than an entire general-purpose kernel's syscall table.

And this is why "container security" as a phrase is slightly misleading — what people actually mean is kernel isolation security. Seccomp profiles restrict which syscalls a container's process is even allowed to make, shrinking the portion of the shared kernel it can reach. AppArmor and SELinux add mandatory access control on top of the namespace boundary. And tools like gVisor and Kata Containers exist specifically because some workloads don't want to trust a shared kernel at all — gVisor intercepts syscalls in userspace to avoid handing them directly to the host kernel, and Kata runs each "container" inside its own lightweight VM. Their existence is itself evidence: an entire segment of the industry builds extra machinery specifically to paper over the fact that a container's isolation boundary is thinner than a VM's, not equivalent to it.

## Metaphors are load-bearing until they aren't

"Lightweight VM" wasn't a lie invented to deceive anyone — it was a reasonable bridge from a concept people already understood (isolated machines) to a genuinely different one (a process with a curated view of a shared kernel), and Docker's own branding, borrowing the shipping-container metaphor, leaned into exactly this kind of approachable-but-inexact framing. The trouble with any borrowed metaphor is that it works right up until you hit the case it was never built to explain, and by then it's already load-bearing in how you reason about the system — how you scope trust, how you think about multi-tenancy, what you assume an attacker can and can't reach.

The transferable habit is to periodically ask, of any isolation mechanism you rely on — containers, cloud tenancy, browser sandboxes, language-level sandboxing — what the actual enforcement boundary is and what shares state or a trust domain across that boundary. Not the marketing name for the boundary. The literal mechanism, and what breaks if that one mechanism has a bug. Every one of these systems has an honest answer to that question, and it's almost never as clean as the metaphor that made the system easy to explain in the first place.


## Linked from

- [1_Tech & Engineering](index.md)
