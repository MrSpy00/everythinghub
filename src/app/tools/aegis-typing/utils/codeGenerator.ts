// ============================================================
// aegisTyping — Infinite Realistic Code Generator Engine
// Supports 11+ Programming Languages with syntax tokens,
// keywords, brackets, operators, types, and realistic snippets.
// ============================================================

export type SupportedCodeLang =
  | "js"
  | "ts"
  | "py"
  | "html"
  | "cpp"
  | "cs"
  | "rust"
  | "go"
  | "java"
  | "sql"
  | "php"
  | "swift";

export interface CodeLangMeta {
  id: SupportedCodeLang;
  label: string;
  name: string;
  badge: string;
}

export const CODE_LANGUAGES: CodeLangMeta[] = [
  { id: "js", label: "JavaScript", name: "JavaScript", badge: "JS" },
  { id: "ts", label: "TypeScript", name: "TypeScript", badge: "TS" },
  { id: "py", label: "Python", name: "Python", badge: "PY" },
  { id: "html", label: "HTML & CSS", name: "HTML & CSS", badge: "HTML" },
  { id: "cpp", label: "C++", name: "C++", badge: "C++" },
  { id: "cs", label: "C#", name: "C#", badge: "C#" },
  { id: "rust", label: "Rust", name: "Rust", badge: "RS" },
  { id: "go", label: "Go", name: "Go", badge: "GO" },
  { id: "java", label: "Java", name: "Java", badge: "JAVA" },
  { id: "sql", label: "SQL", name: "SQL", badge: "SQL" },
  { id: "php", label: "PHP", name: "PHP", badge: "PHP" },
  { id: "swift", label: "Swift", name: "Swift", badge: "SWIFT" },
];

const SNIPPETS: Record<SupportedCodeLang, string[]> = {
  js: [
    "async function fetchUserData(userId, options = {}) {",
    "const response = await fetch(`/api/v1/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });",
    "if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);",
    "const payload = await response.json();",
    "return payload.data.filter((item) => item.isActive && !item.isDeleted);",
    "const [state, setState] = useState({ count: 0, loading: false, error: null });",
    "useEffect(() => { const timer = setInterval(() => tick(), 1000); return () => clearInterval(timer); }, []);",
    "const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);",
    "export const debounce = (fn, delay = 300) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };",
    "const aggregated = items.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.price * curr.quantity }), {});",
    "const result = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));",
    "const sorted = [...users].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));",
    "const { id, username, email = 'default@domain.com', ...rest } = userProfile;",
    "try { await db.collection('logs').insertOne({ timestamp: Date.now(), action: 'LOGIN_SUCCESS' }); } catch (err) { console.error('Log failed:', err); }",
  ],
  ts: [
    "interface UserProfile<T = Record<string, unknown>> { id: string; name: string; email: string; metadata: T; readonly createdAt: Date; }",
    "type ApiResponse<T> = { data: T; status: number; message: string; success: boolean };",
    "export async function queryRecords<T extends { id: string }>(table: string, filter: Partial<T>): Promise<T[]> {",
    "const result = await db.from<T>(table).select('*').match(filter);",
    "if (result.error) throw new DatabaseException(result.error.message);",
    "return result.data ?? [];",
    "}",
    "type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };",
    "export const createHandler = <Req, Res>(handler: (req: Req) => Promise<Res>) => async (req: Req): Promise<Res> => { return await handler(req); };",
    "enum HttpStatus { OK = 200, CREATED = 201, BAD_REQUEST = 400, UNAUTHORIZED = 401, NOT_FOUND = 404, INTERNAL_ERROR = 500 }",
    "export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;",
    "const payload: Readonly<UserSession> = Object.freeze({ token: 'xyz_secret', expiresAt: Date.now() + 3600000, roles: ['admin', 'editor'] });",
  ],
  py: [
    "def calculate_moving_average(data: list[float], window_size: int = 5) -> list[float]:",
    "    if not data or window_size <= 0: return []",
    "    return [sum(data[i : i + window_size]) / window_size for i in range(len(data) - window_size + 1)]",
    "class RateLimiter:",
    "    def __init__(self, max_requests: int = 100, window_seconds: float = 60.0) -> None:",
    "        self.max_requests = max_requests",
    "        self.window = window_seconds",
    "        self._history: dict[str, list[float]] = defaultdict(list)",
    "async def fetch_session(user_id: str, redis_client: aioredis.Redis) -> Optional[dict]:",
    "    raw = await redis_client.get(f'session:{user_id}')",
    "    return json.loads(raw) if raw else None",
    "with open(file_path, mode='r', encoding='utf-8') as stream:",
    "    records = [json.loads(line) for line in stream if line.strip()]",
    "formatted = {k: v.strip().lower() for k, v in raw_dict.items() if v is not None}",
    "@dataclass(frozen=True, slots=True)",
    "class MetricRecord: name: str; value: float; timestamp: int = field(default_factory=time.time_ns)",
  ],
  html: [
    "<div className=\"flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl\">",
    "<button type=\"button\" onClick={handleAction} disabled={isLoading} className=\"px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30\">",
    "<svg className=\"w-5 h-5 text-indigo-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M5 13l4 4L19 7\" /></svg>",
    "<input type=\"text\" placeholder=\"Search components...\" className=\"w-full px-4 py-2 text-sm bg-neutral-900/80 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none\" />",
    ".card-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; backdrop-filter: blur(20px); }",
    "@media (min-width: 1024px) { .dashboard-layout { grid-template-columns: 280px 1fr; } }",
    ".neon-glow { box-shadow: 0 0 25px -5px rgba(34, 211, 238, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15); }",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />",
  ],
  cpp: [
    "template <typename T>",
    "class ThreadSafeQueue {",
    "    private: mutable std::mutex mtx_; std::queue<T> data_queue_; std::condition_variable cv_;",
    "    public: void push(T new_value) { std::lock_guard<std::mutex> lock(mtx_); data_queue_.push(std::move(new_value)); cv_.notify_one(); }",
    "    bool try_pop(T& value) { std::lock_guard<std::mutex> lock(mtx_); if (data_queue_.empty()) return false; value = std::move(data_queue_.front()); data_queue_.pop(); return true; }",
    "};",
    "int main(int argc, char* argv[]) {",
    "    std::vector<int> numbers = {10, 25, 45, 90, 120};",
    "    std::sort(numbers.begin(), numbers.end(), [](int a, int b) { return a > b; });",
    "    for (const auto& num : numbers) { std::cout << \"Value: \" << num << \"\\n\"; }",
    "    return 0;",
    "}",
    "std::unique_ptr<SocketConnection> conn = std::make_unique<SocketConnection>(\"127.0.0.1\", 8080);",
    "if (conn->connect() != StatusCode::SUCCESS) { throw std::runtime_error(\"Connection refused!\"); }",
  ],
  cs: [
    "public async Task<ActionResult<UserProfileDto>> GetUserProfileAsync(Guid userId, CancellationToken ct = default)",
    "{",
    "    var user = await _dbContext.Users.AsNoTracking().Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, ct);",
    "    if (user == null) return NotFound(new ProblemDetails { Title = \"User not found\", Status = StatusCodes.Status404NotFound });",
    "    return Ok(_mapper.Map<UserProfileDto>(user));",
    "}",
    "public record UserProfileDto(Guid Id, string Username, string Email, IReadOnlyList<string> Roles, DateTime CreatedAtUtc);",
    "public interface IRepository<TEntity, in TKey> where TEntity : class, IAggregateRoot",
    "{ Task<TEntity?> GetByIdAsync(TKey id, CancellationToken ct = default); Task AddAsync(TEntity entity, CancellationToken ct = default); }",
    "services.AddHttpClient<IWeatherService, WeatherService>(client => { client.BaseAddress = new Uri(\"https://api.weather.com/\"); client.Timeout = TimeSpan.FromSeconds(10); });",
  ],
  rust: [
    "pub fn parse_packet_header(buffer: &[u8]) -> Result<HeaderFrame, PacketParseError> {",
    "    if buffer.len() < 16 { return Err(PacketParseError::InsufficientBufferLength); }",
    "    let magic = u32::from_be_bytes(buffer[0..4].try_into().unwrap());",
    "    let payload_len = u32::from_be_bytes(buffer[4..8].try_into().unwrap()) as usize;",
    "    Ok(HeaderFrame { magic, payload_len, flags: buffer[8], checksum: buffer[9] })",
    "}",
    "#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]",
    "pub struct WorkerConfig { pub worker_id: usize, pub thread_pool_size: usize, pub queue_capacity: usize }",
    "impl<T: Send + Sync + 'static> ChannelDispatcher<T> {",
    "    pub async fn dispatch(&self, item: T) -> Result<(), DispatchError> { self.sender.send(item).await.map_err(|_| DispatchError::ChannelClosed) }",
    "}",
    "let filtered: Vec<String> = raw_entries.into_iter().filter(|e| e.starts_with(\"sys_\")).map(|mut s| { s.make_ascii_uppercase(); s }).collect();",
  ],
  go: [
    "func HandleIncomingWebhook(w http.ResponseWriter, r *http.Request) {",
    "    if r.Method != http.MethodPost { http.Error(w, \"Method Not Allowed\", http.StatusMethodNotAllowed); return }",
    "    var payload WebhookEventPayload",
    "    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil { http.Error(w, err.Error(), http.StatusBadRequest); return }",
    "    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)",
    "    defer cancel()",
    "    if err := processEvent(ctx, &payload); err != nil { http.Error(w, \"Internal Server Error\", http.StatusInternalServerError); return }",
    "    w.Header().Set(\"Content-Type\", \"application/json\")",
    "    w.WriteHeader(http.StatusOK)",
    "    _ = json.NewEncoder(w).Encode(map[string]string{\"status\": \"accepted\"})",
    "}",
    "type MetricsCollector struct { mu sync.RWMutex; counter map[string]int64; active bool }",
  ],
  java: [
    "public static <T> CompletableFuture<List<T>> processBatchAsync(List<T> items, ExecutorService executor) {",
    "    return CompletableFuture.supplyAsync(() -> items.parallelStream().filter(Objects::nonNull).distinct().collect(Collectors.toList()), executor);",
    "}",
    "@RestController",
    "@RequestMapping(\"/api/v2/analytics\")",
    "public class AnalyticsController {",
    "    private final AnalyticsService analyticsService;",
    "    public AnalyticsController(AnalyticsService analyticsService) { this.analyticsService = analyticsService; }",
    "    @GetMapping(\"/summary\")",
    "    public ResponseEntity<AnalyticsSummaryDto> getSummary(@RequestParam @NotNull Instant from, @RequestParam @NotNull Instant to) {",
    "        return ResponseEntity.ok(this.analyticsService.calculateSummary(from, to));",
    "    }",
    "}",
  ],
  sql: [
    "SELECT u.id, u.username, u.email, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS lifetime_value",
    "FROM users u",
    "LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'COMPLETED'",
    "WHERE u.is_active = TRUE AND u.created_at >= '2026-01-01 00:00:00'",
    "GROUP BY u.id, u.username, u.email",
    "HAVING COUNT(o.id) >= 3 AND SUM(o.total_amount) > 500.00",
    "ORDER BY lifetime_value DESC, total_orders DESC",
    "LIMIT 50 OFFSET 0;",
    "CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_lower ON users (LOWER(email)) WHERE deleted_at IS NULL;",
    "ALTER TABLE user_sessions ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
  ],
  php: [
    "public function handleUserRegistration(RegisterRequest $request): JsonResponse {",
    "    $validated = $request->validated();",
    "    DB::beginTransaction();",
    "    try {",
    "        $user = User::create(['name' => $validated['name'], 'email' => strtolower($validated['email']), 'password' => Hash::make($validated['password'])]);",
    "        event(new UserRegisteredEvent($user));",
    "        DB::commit();",
    "        return response()->json(['success' => true, 'data' => new UserResource($user)], 201);",
    "    } catch (\\Throwable $e) {",
    "        DB::rollBack();",
    "        Log::error('Registration failed: ' . $e->getMessage());",
    "        return response()->json(['success' => false, 'error' => 'Registration error'], 500);",
    "    }",
    "}",
  ],
  swift: [
    "func fetchUserProfile(userId: String) async throws -> UserProfile {",
    "    guard let url = URL(string: \"https://api.everythinghub.com.tr/v1/users/\\(userId)\") else { throw NetworkError.invalidURL }",
    "    var request = URLRequest(url: url)",
    "    request.httpMethod = \"GET\"",
    "    request.setValue(\"Bearer \\(self.authToken)\", forHTTPHeaderField: \"Authorization\")",
    "    let (data, response) = try await URLSession.shared.data(for: request)",
    "    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else { throw NetworkError.serverError }",
    "    return try JSONDecoder().decode(UserProfile.self, from: data)",
    "}",
    "struct UserProfile: Identifiable, Codable, Sendable { let id: String; let username: String; let email: String; let avatarUrl: URL? }",
  ],
};

/**
 * Procedural infinite word/token generator for programming code
 */
export function generateCodeWords(lang: SupportedCodeLang, count: number = 80): string[] {
  const snippets = SNIPPETS[lang] ?? SNIPPETS.js;
  const resultWords: string[] = [];

  while (resultWords.length < count) {
    // Pick random snippets and extract code words
    const snippet = snippets[Math.floor(Math.random() * snippets.length)];
    const wordsInSnippet = snippet.trim().split(/\s+/).filter(Boolean);
    resultWords.push(...wordsInSnippet);
  }

  return resultWords.slice(0, count);
}
