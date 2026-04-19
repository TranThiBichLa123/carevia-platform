const baseURL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:8081/api/v1";

type ApiError = {
	message: string;
	code: string | number;
};

export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: ApiError;
};

const endpointAliases: Record<string, string> = {
	"/auth/signin": "/auth/login",
	"/auth/signup": "/auth/register",
	"/auth/profile": "/auth/me",
};

const normalizeRole = (role: unknown): string => {
	if (typeof role !== "string") {
		return "CLIENT";
	}

	if (role.toLowerCase() === "user") {
		return "CLIENT";
	}

	return role.toUpperCase();
};

const getAuthToken = (): string | undefined => {
	if (typeof document === "undefined") {
		return undefined;
	}

	const cookies = document.cookie.split(";").reduce((acc, cookie) => {
		const [name, value] = cookie.trim().split("=");
		acc[name] = value;
		return acc;
	}, {} as Record<string, string>);

	return cookies.auth_token;
};

const normalizeUrl = (url: string) => endpointAliases[url] || url;

const normalizeBody = (url: string, body: unknown) => {
	if (!body || typeof body !== "object") {
		return body;
	}

	const payload = body as Record<string, unknown>;
	const normalizedUrl = normalizeUrl(url);

	if (normalizedUrl === "/auth/register") {
		return {
			username:
				typeof payload.username === "string"
					? payload.username
					: typeof payload.name === "string"
						? payload.name.trim().replace(/@/g, "")
						: "",
			email: typeof payload.email === "string" ? payload.email.trim() : "",
			password: payload.password,
			role: normalizeRole(payload.role),
			langKey: payload.langKey || "vi",
		};
	}

	if (normalizedUrl === "/auth/signin") {
		return {
			login:
				payload.login || payload.email || payload.username || payload.identifier,
			password: payload.password,
		};
	}

	return body;
};

const unwrapPayload = (payload: unknown) => {
	if (
		payload &&
		typeof payload === "object" &&
		"success" in payload &&
		"data" in payload
	) {
		return (payload as { data?: unknown }).data;
	}

	return payload;
};

const normalizeResponseData = (url: string, payload: unknown) => {
	const normalizedUrl = normalizeUrl(url);

	if (
		normalizedUrl === "/auth/signin" &&
		payload &&
		typeof payload === "object"
	) {
		const loginPayload = payload as {
			accessToken?: string;
			refreshToken?: string;
			user?: {
				id?: number | string;
				username?: string;
				fullName?: string;
				email?: string;
				avatarUrl?: string;
				role?: string;
			};
		};

		return {
			token: loginPayload.accessToken,
			refreshToken: loginPayload.refreshToken,
			_id: String(loginPayload.user?.id ?? ""),
			name: loginPayload.user?.fullName || loginPayload.user?.username || "",
			username: loginPayload.user?.username || "",
			email: loginPayload.user?.email || "",
			avatar: loginPayload.user?.avatarUrl || "",
			role: loginPayload.user?.role || "",
		};
	}

	if (
		normalizedUrl === "/auth/me" &&
		payload &&
		typeof payload === "object"
	) {
		const mePayload = payload as {
			accountId?: number | string;
			username?: string;
			fullName?: string;
			email?: string;
			avatarUrl?: string;
			role?: string;
			status?: string;
			birthday?: string;
			bio?: string;
			gender?: string;
			lastLoginAt?: string;
		};

		return {
			_id: String(mePayload.accountId ?? ""),
			name: mePayload.fullName || mePayload.username || "",
			username: mePayload.username || "",
			email: mePayload.email || "",
			avatar: mePayload.avatarUrl || "",
			role: mePayload.role || "",
			status: mePayload.status,
			birthday: mePayload.birthday,
			bio: mePayload.bio,
			gender: mePayload.gender,
			lastLoginAt: mePayload.lastLoginAt,
		};
	}

	return payload;
};

const readResponseBody = async (response: Response) => {
	if (response.status === 204) {
		return undefined;
	}

	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		const text = await response.text();
		return text || undefined;
	}

	return response.json();
};

const buildError = (status: number, payload: unknown): ApiError => {
	if (payload && typeof payload === "object") {
		const errorPayload = payload as {
			message?: string;
			error?: string;
			code?: string | number;
		};

		return {
			message:
				errorPayload.message ||
				errorPayload.error ||
				`HTTP error ${status}`,
			code: errorPayload.code || status,
		};
	}

	if (typeof payload === "string" && payload.trim()) {
		return {
			message: payload,
			code: status,
		};
	}

	return {
		message: `HTTP error ${status}`,
		code: status,
	};
};

const request = async <T = unknown>(
	method: "GET" | "POST" | "PUT" | "DELETE",
	url: string,
	body?: unknown
): Promise<ApiResponse<T>> => {
	try {
		const token = getAuthToken();
		const normalizedUrl = normalizeUrl(url);
		const normalizedBody = normalizeBody(url, body);
		const response = await fetch(`${baseURL}${normalizedUrl}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			credentials: "include",
			...(normalizedBody !== undefined
				? { body: JSON.stringify(normalizedBody) }
				: {}),
		});

		const rawPayload = await readResponseBody(response);
		if (!response.ok) {
			return {
				success: false,
				error: buildError(response.status, rawPayload),
			};
		}

		const unwrappedPayload = unwrapPayload(rawPayload);
		return {
			success: true,
			data: normalizeResponseData(url, unwrappedPayload) as T,
		};
	} catch (error) {
		console.error("authApi request failed:", method, url, error);
		return {
			success: false,
			error: {
				message:
					"Unable to connect to the server. Please check if the server is running.",
				code: "ERR_NETWORK",
			},
		};
	}
};

const authApi = {
	get: <T = unknown>(url: string) => request<T>("GET", url),
	post: <T = unknown>(url: string, body: unknown) =>
		request<T>("POST", url, body),
	put: <T = unknown>(url: string, body: unknown) =>
		request<T>("PUT", url, body),
	delete: <T = unknown>(url: string) => request<T>("DELETE", url),
};

export default authApi;
