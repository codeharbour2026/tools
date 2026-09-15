import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

function toolMeta(toolId) {
    return (window.TOOLS || []).find(function (t) { return t.id === toolId; });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

function toolCard(toolId, extraLabel) {
    const tool = toolMeta(toolId);
    const a = document.createElement("a");
    a.className = "order-card";
    a.href = "index.html?open=" + encodeURIComponent(toolId);

    if (!tool) {
        a.innerHTML = `<div class="order-main"><h3>Unknown tool</h3><p>${escapeHtml(toolId)}</p></div>`;
        return a;
    }

    a.innerHTML = `
        <div class="order-main">
            <h3>${escapeHtml(tool.name)}</h3>
            <p>${escapeHtml(tool.blurb)}</p>
        </div>
        <div class="order-side">
            ${extraLabel ? `<span style="color:var(--ink-soft); font-size:.82rem;">${escapeHtml(extraLabel)}</span>` : ""}
        </div>
    `;
    return a;
}

async function init() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
        window.location.href = "signin.html";
        return;
    }

    document.getElementById("accountEmail").textContent = session.user.email;

    const favGrid = document.getElementById("favGrid");
    const favEmpty = document.getElementById("favEmpty");
    const { data: favorites } = await supabase
        .from("tool_favorites")
        .select("tool_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    if (!favorites || favorites.length === 0) {
        favEmpty.style.display = "block";
    } else {
        favorites.forEach(function (row) { favGrid.appendChild(toolCard(row.tool_id)); });
    }

    const recentGrid = document.getElementById("recentGrid");
    const recentEmpty = document.getElementById("recentEmpty");
    const { data: recents } = await supabase
        .from("tool_recent")
        .select("tool_id, opened_at")
        .eq("user_id", session.user.id)
        .order("opened_at", { ascending: false })
        .limit(8);

    if (!recents || recents.length === 0) {
        recentEmpty.style.display = "block";
    } else {
        recents.forEach(function (row) {
            const when = new Date(row.opened_at).toLocaleDateString("en-AU");
            recentGrid.appendChild(toolCard(row.tool_id, "Opened " + when));
        });
    }
}

document.getElementById("signOutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    window.location.href = "index.html";
});

init();
