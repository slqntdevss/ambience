const messageBox = document.getElementById("message-box");
const sendButton = document.getElementById("send-button");
const messageContainer = document.getElementById("message-container");
sendButton.addEventListener("click", async () => {
	try {
		const message = document.createElement("div");
		const text = document.createElement("p");

		message.classList = "message user-message";
		message.appendChild(text);
		text.innerText = messageBox.value.trim();
		messageContainer.appendChild(message);
		const response = await fetch("/ai", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt: messageBox.value.trim() }),
		});

		if (response.ok) {
			messageBox.value = "";
			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let partial = "";
			const message = document.createElement("div");
			const text = document.createElement("p");

			message.classList = "message ai-message";
			message.appendChild(text);
			messageContainer.appendChild(message);

			let fullResponse = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				try {
					setTimeout(() => {
						const chunk = decoder.decode(value, { stream: true });
						partial += chunk;
						fullResponse += chunk;

						text.innerHTML = marked.parse(fullResponse);
					}, 25);
				} catch (e) {
					console.error("Decoding error:", e);
				}
			}
		}
	} catch (err) {
		console.error("failed to send AI request: ", err);
	}
});
