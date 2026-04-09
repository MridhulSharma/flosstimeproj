import { AIContext } from "./ai-context";

/**
 * Built-in rule-based AI engine that generates responses from real MongoDB data.
 * No external API key required — works out of the box.
 */
export function generateAIResponse(
  message: string,
  context: AIContext
): string {
  const lower = message.toLowerCase();

  // Availability queries
  const dayMatch = lower.match(
    /(?:available|availability|who.+(?:on|for))\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  );
  if (dayMatch) {
    const day = dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1);
    const available = context.staffList.filter(
      (s) => s.status === "Active" && s.availableDays.includes(day)
    );
    if (available.length === 0) {
      return `No active staff members are available on **${day}**.`;
    }
    const grouped = {
      Doctor: available.filter((s) => s.jobType === "Doctor"),
      Hygienist: available.filter((s) => s.jobType === "Hygienist"),
      Assistant: available.filter((s) => s.jobType === "Assistant"),
    };
    let resp = `## Staff Available on ${day}\n\n**${available.length} staff members** are available:\n\n`;
    for (const [role, staff] of Object.entries(grouped)) {
      if (staff.length > 0) {
        resp += `### ${role}s (${staff.length})\n`;
        staff.forEach((s) => {
          resp += `- **${s.name}** — ${s.travelRadius}mi radius\n`;
        });
        resp += "\n";
      }
    }
    return resp;
  }

  // Team suggestion
  if (
    lower.includes("suggest") && (lower.includes("team") || lower.includes("staff")) ||
    lower.includes("build a team") ||
    lower.includes("recommend a team")
  ) {
    const active = context.staffList.filter((s) => s.status === "Active");
    const doctors = active.filter((s) => s.jobType === "Doctor");
    const hygienists = active.filter((s) => s.jobType === "Hygienist");
    const assistants = active.filter((s) => s.jobType === "Assistant");

    if (active.length === 0) {
      return "There are no active staff members to build a team from. Add some staff first!";
    }

    let resp = "## Suggested Team\n\nBased on your current roster, here's a recommended team:\n\n";
    if (doctors.length > 0) {
      resp += `- **${doctors[0].name}** — Doctor (${doctors[0].travelRadius}mi radius)\n`;
    }
    hygienists.slice(0, 2).forEach((h) => {
      resp += `- **${h.name}** — Hygienist (${h.travelRadius}mi radius)\n`;
    });
    assistants.slice(0, 1).forEach((a) => {
      resp += `- **${a.name}** — Assistant (${a.travelRadius}mi radius)\n`;
    });

    const teamSize =
      Math.min(doctors.length, 1) +
      Math.min(hygienists.length, 2) +
      Math.min(assistants.length, 1);

    resp += `\n**Team size:** ${teamSize} members\n\n`;

    if (doctors.length === 0) {
      resp += "**Note:** No doctors available — consider hiring or reactivating one.\n";
    }
    if (hygienists.length < 2) {
      resp += "**Note:** Only " + hygienists.length + " hygienist(s) available — ideal is 2.\n";
    }

    return resp;
  }

  // Summary / overview
  if (
    lower.includes("summary") ||
    lower.includes("overview") ||
    lower.includes("how many") ||
    lower.includes("stats") ||
    lower.includes("tell me about")
  ) {
    const s = context.staffSummary;
    const w = context.worksiteSummary;
    const sch = context.scheduleSummary;

    return `## FlossTime Overview

### Staff
- **${s.total}** total members (${s.active} active, ${s.inactive} inactive)
- ${s.doctors} Doctors, ${s.hygienists} Hygienists, ${s.assistants} Assistants
- Average travel radius: **${s.avgRadius} miles**

### Worksites
- **${w.total}** total (${w.active} active, ${w.inactive} inactive)

### Schedule
- **${sch.thisMonth}** assignments this month
- **${sch.upcoming}** upcoming assignments (${sch.confirmed} confirmed)

${s.total === 0 ? "Get started by adding staff members!" : ""}`;
  }

  // Travel radius
  if (lower.includes("radius") || lower.includes("travel")) {
    const sorted = [...context.staffList]
      .filter((s) => s.status === "Active")
      .sort((a, b) => b.travelRadius - a.travelRadius);

    if (sorted.length === 0) {
      return "No active staff members found.";
    }

    let resp = "## Staff by Travel Radius\n\n";
    sorted.forEach((s) => {
      resp += `- **${s.name}** (${s.jobType}) — ${s.travelRadius}mi\n`;
    });
    resp += `\n**Average:** ${context.staffSummary.avgRadius}mi`;
    return resp;
  }

  // Composition / breakdown
  if (
    lower.includes("composition") ||
    lower.includes("breakdown") ||
    lower.includes("roles")
  ) {
    const s = context.staffSummary;
    const total = s.total || 1;
    return `## Team Composition

- **Doctors:** ${s.doctors} (${Math.round((s.doctors / total) * 100)}%)
- **Hygienists:** ${s.hygienists} (${Math.round((s.hygienists / total) * 100)}%)
- **Assistants:** ${s.assistants} (${Math.round((s.assistants / total) * 100)}%)

Total active staff: **${s.active}** of ${s.total}`;
  }

  // Worksites
  if (lower.includes("worksite") || lower.includes("client") || lower.includes("location")) {
    if (context.worksiteList.length === 0) {
      return "No worksites have been added yet. Go to **Worksites** to create one!";
    }
    let resp = "## Worksites\n\n";
    context.worksiteList.forEach((w) => {
      resp += `- **${w.clientName}** — ${w.city}, ${w.state} (${w.status})\n`;
    });
    return resp;
  }

  // Assignments / schedule
  if (
    lower.includes("assignment") ||
    lower.includes("schedule") ||
    lower.includes("upcoming") ||
    lower.includes("this week") ||
    lower.includes("this month")
  ) {
    if (context.recentAssignments.length === 0) {
      return "No upcoming assignments found. Head to the **Schedule Builder** to create one!";
    }
    let resp = "## Upcoming Assignments\n\n";
    context.recentAssignments.forEach((a) => {
      resp += `- **${a.title}** — ${a.clientName} on ${a.date.split("T")[0]} (${a.status}, team: ${a.teamSize})\n`;
    });
    return resp;
  }

  // Conflicts
  if (lower.includes("conflict")) {
    return `I checked the current schedule and staff availability. To detect specific conflicts, I'd need to cross-reference assignment dates with staff availability days.

**Quick check:** Make sure each assignment date's day of week matches the assigned team members' available days. You can review this in the **Schedule Builder**.`;
  }

  // Greeting
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
    return `Hello! I'm your FlossTime AI assistant. I can help you with:\n\n- **Staff availability** — "Who is available on Monday?"\n- **Team suggestions** — "Suggest a team for this week"\n- **Data summaries** — "Show me a staffing summary"\n- **Scheduling help** — "What assignments are coming up?"\n\nWhat would you like to know?`;
  }

  // Fallback
  return `I can help you with staff scheduling questions! Try asking me:\n\n- "Who is available on [day]?"\n- "Suggest a team"\n- "Show me a summary"\n- "What assignments are coming up?"\n- "Which staff have the largest travel radius?"\n- "Show team composition breakdown"`;
}
