import { assertEquals } from "jsr:@std/assert";


Deno.test("simple test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

Deno.test("Should save and shorten url", async () => {
    const res = await fetch("http://localhost:3000/api/shorturl", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: "https://www.google.com" })
    });
    const data = await res.json();
    assertEquals(data.original_url, "https://www.google.com");
});

Deno.test("Should reject not saved url", async () => {
    const res = await fetch("http://localhost:3000/api/shorturl", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: "https://www.google.com" })
    });
});

Deno.test("Should redirect to original url", async () => {
    const res = await fetch("http://localhost:3000/api/shorturl", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: "https://www.github.com" })
    });

    const data = await res.json();
    const res2 = await fetch(`http://localhost:3000/api/shorturl/${data.short_url}`);

    console.log(res2.status);
    assertEquals(res.status >= 300 && res.status < 400, true);
});