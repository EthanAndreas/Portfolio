---
theme: deep
next: false
prev: false
icon: 'github'
link: '<https://github.com/EthanAndreas/SoS2MIPS>' 
---

# [Sos2Mips](<https://github.com/EthanAndreas/SoS2MIPS>)

Convert a SOS file to MIPS file 

## Introduction

This project is a part of the course "Compilation" at the University of Strasbourg. The goal is to create a compiler that converts a SOS file to MIPS file.

## SOS language

The SOS language is a simple language that allows to write programs in a simplified C language. The SOS language is defined by the following grammar:

```python
<program> → <instructions_list>

<instructions_list> → <instructions_list> ; <instruction>
                    | <instruction>

<instruction> → id = <concatenation>
              | id[<int_operand>] = <concetenation>
              | declare id[int]
              | if <test_bloc> then <instructions_list> <else_part> 
              | for id do <instructions_list> done
              | for id in <operands_list> do <instructions_list> done
              | while <test_bloc> do <instructions_list> done
              | until <test_bloc> do <instructions_list> done
              | case <operand> in <case_list> esac
              | echo <operands_list>
              | read id | read id[<int_operand>]
              | <function_declare>
              | <function_call>
              | return | return <int_operand>
              | exit | exit <int_operand>

<else_part> → elif <test_bloc> then <instructions_list> <else_part>
            | else <instructions_list>
            | ε

<case_list> → <case_list> <filters> ) <instructions_list> ; ;
            | <filters> ) <instructions_list> ; ;

<filters> → word | "string" | 'string'
          | <filters> '|' word
          | <filters> '|' "string"
          | <filters> '|' 'string'
          | *

<operands_list> → <operands_list> <operand>
                | <operand>
                | ${id[*]}

<concatenation> → <concatenation> <operand>
                | <operand>

<test_bloc> → test <test_expr>

<test_expr> → <test_expr> -o <test_expr2>
            | <test_expr2>

<test_expr2> → <test_expr2> -a <test_expr3>
             | <test_expr3>

<test_expr3> → ( <test_expr> )
             | ! ( <test_expr> )
             | <test_instruction>
             | ! <test_instruction>

<test_instruction> → <concatenation> = <concatenation>
                   | <concatenation> != <concatenation>
                   | <operator1> <concatenation>
                   | <operand> <operator2> <operand>

<operand> → ${id} | ${id[<int_operand>]}
          | word | $int | $* | $ ?
          | "string" | 'string'
          | $( expr <int_sum> )
          | $( <function_call> )

<operator1> → -n | -z

<operator2> → -eq | -ne | -gt | -ge | -lt | -le

<int_sum> → <int_sum> <more_or_less> <int_product>
          | <int_product>

<int_product> → <int_product> <mult_div_mod> <int_operand>
              | <int_operand>

<int_operand> → ${id} | ${id[<int_operand>]} | $int
              | <more_or_less> ${id}
              | <more_or_less> ${id[<int_operand>]}
              | <more_or_less> $int
              | int | <more_or_less> int
              | ( <int_sum> )

<more_or_less> → + | -

<mult_div_mod> → * | / | %

<function_declare> → id ( ) { <local_declare> <instructions_list> }

<local_declare> → <local_declare> local id = <concatenation> ;
           | ε

<function_call> → id <operands_list>
                | id
```

## MIPS language

The MIPS language is a simplified MIPS language. The MIPS language is defined by the following grammar:

```python
<program> → <instruction_list>

<instruction_list> → <instruction_list> <instruction>
                   | <instruction>

<instruction> → <arithmetic_instruction>
              | <load_store_instruction>
              | <branch_instruction>
              | <jump_instruction>
              | <syscall_instruction>

<arithmetic_instruction> → add <reg>, <reg>, <reg>
                         | sub <reg>, <reg>, <reg>
                         | addi <reg>, <reg>, int
                         | mult <reg>, <reg>
                         | div <reg>, <reg>

load_store_instruction → lw <reg>, offset(<reg>)
                       | sw <reg>, offset(<reg>)

<branch_instruction> → beq <reg>, <reg>, id
                     | bne <reg>, <reg>, id

<jump_instruction> → j id
                   | jal target
                   | jr <reg>

syscall_instruction → syscall

<reg> → $t0 | $t1 | $t2 | $t3 | $t4 | $t5 | $t6 | $t7 | $t8 | $t9
      | $s0 | $s1 | $s2 | $s3 | $s4 | $s5 | $s6 | $s7
      | $a0 | $a1 | $a2 | $a3
      | $v0 | $v1
      | $zero
```

## How it works

The compiler is divided into 3 parts:

- The lexical analysis
- The syntactic analysis
- The conversion to MIPS

### Lexical analysis

The lexical analysis is done by the `lex` tool for generating lexical analyzers in C language. 
The file `gen/lexer.l` contains the lexical rules of the SOS language.
It runs through the file and generates a tree.

### Syntactic analysis

The syntactic analysis is done by the `yacc` tool for generating syntactic analyzers in C language.
The file `gen/parser.y` contains the syntactic rules of the SOS language.
For each rule, a case is defined.
It runs through the tree generated by the lexical analysis and generates a vector of cases.

### Conversion to MIPS

The conversion to MIPS is done by the `src/protocol.c` file.
It runs through the vector of cases generated by the syntactic analysis and generates a MIPS operation for each case.

## How to use

Generate the assembly code with the sos file and execute the assembly code with the QtSpim simulator.

```bash
make
./bin/sos examples/hello_world.sos --tos --verbose
```

With ``--tos`` option, the symbol table is displayed, and with ``--verbose`` option, all step of the compiler are displayed (lexical analysis, syntactic analysis).

## GitHub repository

[View on GitHub](https://github.com/EthanAndreas/SoS2MIPS)
