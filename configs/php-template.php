<?php
// This file is part of Stack - https://stack.maths.ed.ac.uk
//
// Stack is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Stack is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Stack.  If not, see <http://www.gnu.org/licenses/>.

////////////////////////////////////////////////////////////////////
// THIS FILE HAS BEEN GENERATED, DO NOT EDIT, EDIT THE GENERATOR. //
////////////////////////////////////////////////////////////////////
/*
 @copyright  2025 Matti Harjula, Aalto University.
 @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.
*/

require_once(__DIR__ . '/../MP_classes.php');
require_once(__DIR__ . '/../lexer.base.class.php');
require_once(__DIR__ . '/../parser.common.classes.php');
require_once(__DIR__ . '/../parser.options.class.php');


class stack_maxima_parser2_###class-name### {
    private stack_maxima_parser_table_holder $tables;
    private stack_parser_options $options;

    // The selection of the correct reduce logic could be done
    // with a switch or a match, but then one would need to 
    // actually check for the value. Instead, we use an array:
    //  - Here rule-number maps to a tuple of number of items
    //    to extract from the stack and a function to give those to
    private static $reducemap = ###reduce-map###;

    public function __construct(stack_parser_options $options) {
        $this->options = $options;
        $this->tables = stack_maxima_parser_table_holder::get_for_grammar('###tables-json###');
    }

    /**
     * Attempts to parse whatever is left in the lexer. 
     * 
     * Should insertions be enabled and lead to notes being generated
     * will add them to the given array.
     * 
     * May throw a stack_maxima_parser_exception
     */
    public function parse(stack_maxima_lexer_base $lexer, array &$notes = []): ?MP_Node {
        // Collect comments here, for injection to statement-lists.
        // Should the we collect them at all depends on the options.
        $commentdump = [];
        $collectcomments = !$this->options->dropcomments;

        // Insertion of extra tokens might care if we have seen whitespace.
        $whitespaceseen = false;

        // Track previous token.
        $previous = null;

        // The parser stack starts from state 0, i.e., the "Start" rule.
        $stack = [0];
        $shifted = true; // Starting without a token.
        $t = null; // The raw token.
        $T = null; // The symbolic token. e.g. NUM.

        // For KEYWORD -> ID remapping we need to have revert capability.
        // Basically, if someone uses a keyword like `in` or `%not` in
        // variable role we do as follows:
        //  - If an action would exist at that place for an ID.
        //  - We clone the current stack and save it
        //  - We also clone that token.
        //  - If the next token finds an action all is fine
        //    and we clean these.
        //  - If not then we revert and consider that token as an ID.
        $kreverttoken = null;
        $krevertstack = null;
        $krevertreset = 0;

        while (true) {
            if ($shifted) {
                $previous = $t;
                $t = $lexer->get_next_token();
                while ($t !== null && ($t->type === StackMaximaTokenType::WhiteSpace || $t->type === StackMaximaTokenType::Comment)) {
                    if ($t->type === StackMaximaTokenType::WhiteSpace) {
                        $whitespaceseen = true;
                    } else if ($collectcomments && $t->type == StackMaximaTokenType::Comment) {
                        $c = new MP_Comment($t->value, []);
                        $c->set_position_from_parser_token($t);
                        $commentdump[] = $c;
                    }
                    $t = $lexer->get_next_token();
                }
                if ($t === null) {
                    // End of stream.
                    $T = "END OF FILE";
                } else {
                    switch ($t->type) {
                        case StackMaximaTokenType::Symbol:
                            if ($t->value === '@@Is@@' && array_search('fixspaces', $notes) === false) {
                                // Some specific notation of the pre-parser side.
                                if (array_search('spaces', $notes) === false) {
                                    $notes[] = 'spaces';
                                }
                            } else if ($t->value === '@@IS@@' && array_search('insertstars', $notes) === false) {
                                if (array_search('missing_stars', $notes) === false) {
                                    $notes[] = 'missing_stars';
                                }
                            } else if ($t->value === '^' || $t->value === '^^' || $t->value === '**') {
                                // Some operator precendence cases are difficult.
                                $next = $lexer->get_next_token();
                                $lookahead = [];
                                while ($next !== null && ($next->type === StackMaximaTokenType::WhiteSpace || $next->type === StackMaximaTokenType::Comment)) {
                                    if ($next->type === StackMaximaTokenType::Comment) {
                                        if ($collectcomments) {
                                            $c = new MP_Comment($t->value, []);
                                            $c->set_position_from_parser_token($t);
                                            $commentdump[] = $c;
                                        }
                                    } else {
                                        $lookahead[] = $next;
                                    }
                                    $next = $lexer->get_next_token();
                                }
                                if ($next !== null && $next->type === StackMaximaTokenType::Symbol && ($next->value === '-' || $next->value === '+' || $next->value === '+-' || $next->value === '#pm#')) {
                                    $T = ' ' . $t->value . $next->value;
                                    $t = $t->merge($next);
                                    break;
                                } else {
                                    if ($next !== null) {
                                        $lexer->return_token($next);
                                    }
                                    while (count($lookahead) > 0) {
                                        $lexer->return_token(array_pop($lookahead));
                                    }
                                }
                            }
                        case StackMaximaTokenType::Keyword:
                            $T = $t->value;
                            break;
                        case StackMaximaTokenType::IdAtom:
                            $T = 'ID';
                            break;
                        case StackMaximaTokenType::IntAtom:
                            $T = 'INT';
                            break;
                        case StackMaximaTokenType::FloatAtom:
                            $T = 'FLOAT';
                            break;
                        case StackMaximaTokenType::BoolAtom:
                            $T = 'BOOL';
                            break;
                        case StackMaximaTokenType::StringAtom:
                            $T = 'STRING';
                            break;
                        case StackMaximaTokenType::ListSeparator:
                            $T = 'LIST SEP';
                            break;
                        case StackMaximaTokenType::EndToken:
                            $T = 'END TOKEN';
                            break;
                        case StackMaximaTokenType::LispIdentifier:
                            $T = 'LISP ID';
                            break;
                        case StackMaximaTokenType::Error:
                        default:
                            throw new stack_maxima_parser_exception(
                                'Lexer side error',
                                [],
                                $t,
                                $lexer->original,
                                $previous,
                                array_filter($stack, 'stack_maxima_parser_exception_partial_filter')
                            );
                    }
                }
                $shifted = false;
            }

            // Not checking if the top of the stack is a state number
            // it simply must be.
            $currentstate = $stack[count($stack) - 1];

            $action = $this->tables->get_action($currentstate, $T);

            // The revert case for KEYWORD -> ID.
            if ($action !== null && $t !== null && $t->type === StackMaximaTokenType::Keyword) {
                if ($this->tables->get_action($currentstate, 'ID') !== null) {
                    $kreverttoken = $t;
                    $krevertstack = array_merge([],$stack);
                    $krevertreset = 3;
                }
            }

            if ($krevertreset == 1) {
                // We cannot revert too far back. Currently only one step.
                $krevertstack = null;
                $kreverttoken = null;
            }

            if ($action === null) {
                if ($this->options->tryinsert === StackParserInsertionOption::Stars) {
                    if ($this->tables->get_action($currentstate, '*') !== null) {
                        $nt = new stack_maxima_lexer_token(new stack_maxima_lexer_char('*', $t->startline, $t->startcolumn, $t->startchar));
                        $nt->type = StackMaximaTokenType::Symbol;
                        if ($whitespaceseen) {
                            $nt->note = 'inserted with whitespace';
                            if (array_search('spaces', $notes) === false) {
                                $notes[] = 'spaces';
                            }
                        } else {
                            $nt->note = 'inserted without whitespace';
                            if (array_search('missing_stars', $notes) === false) {
                                $notes[] = 'missing_stars';
                            }
                        }
                        $lexer->return_token($t);
                        $t = $nt;
                        $T = '*';
                        $action = $this->tables->get_action($currentstate, $T);
                    }
                } else if ($this->options->tryinsert === StackParserInsertionOption::EndToken) {
                    if ($this->tables->get_action($currentstate, 'END TOKEN') !== null) {
                        $nt = new stack_maxima_lexer_token(new stack_maxima_lexer_char(';', $t->startline, $t->startcolumn, $t->startchar));
                        $nt->type = StackMaximaTokenType::EndToken;
                        $lexer->return_token($t);
                        $t = $nt;
                        $T = 'END TOKEN';
                        $action = $this->tables->get_action($currentstate, $T);
                    }
                }
            }

            // The KEYWORD -> ID case.
            if ($action === null && $kreverttoken !== null) {
                // Go back one step.
                if ($t !== null) {
                    $lexer->return_token($t);
                }
                $t = $kreverttoken;
                $t->type = StackMaximaTokenType::IdAtom;
                $T = 'ID';
                $stack = $krevertstack;
                $currentstate = $stack[count($stack) - 1];
                $action = $this->tables->get_action($currentstate, $T);
                $kreverttoken = null;
                $krevertstack = [];
            }

            if ($action === null) {
                throw new stack_maxima_parser_exception(
                    'No action available',
                    $this->tables->get_expected($currentstate),
                    $t,
                    $lexer->original,
                    $previous,
                    array_filter($stack, 'stack_maxima_parser_exception_partial_filter')
                );
            }
            $krevertreset = $krevertreset - 1;

            if (count($action) === 1) {
                // A shift.
                $stack[] = $t;
                $stack[] = $action[0];
                $shifted = true;
            } else {
                // Reduce.
                [$rule, $nt_name, $nt_id] = $action;

                // Logic.
                [$numargs, $funnum] = self::$reducemap[$rule];
                
                $args = [];
                while ($numargs > 0) {
                    $numargs--;
                    array_pop($stack); // Drop a state number.
                    $args[] = array_pop($stack);
                }
                // Now we could reverse this array, or we could simply write
                // the function arguments in a different order, we choose the latter.
                $reduced = call_user_func_array([$this, 'r'.$funnum], $args);

                // If we just reduced the start rule then that is it.
                if ($nt_name === 'Start') {
                    if (count($commentdump) > 0 && $reduced instanceof MP_Root) {
                        $interleaved = [];
                        $commenttoassign = array_shift($commentdump);
                        $lastassigned = null;
                        foreach ($reduced->items as $item) {
                            while ($commenttoassign !== null &&
                                $commenttoassign->position['start'] < $item->position['start']) {
                                $interleaved[] = $commenttoassign;
                                $lastassigned = $commenttoassign;
                                $commenttoassign = array_shift($commentdump);
                            }
                            while ($commenttoassign !== null &&
                                $commenttoassign->position['start'] < $item->position['end']) {
                                $item->internalcomments[] = $commenttoassign;
                                $lastassigned = $commenttoassign;
                                $commenttoassign = array_shift($commentdump);
                            }
                            $interleaved[] = $item;
                        }
                        if ($commenttoassign !== null && ($lastassigned === null || $lastassigned !== $commenttoassign)) {
                            $interleaved[] = $commenttoassign;
                        }
                        foreach ($commentdump as $commenttoassign) {
                            $interleaved[] = $commenttoassign;
                        }
                        $reduced->items = $interleaved;
                    }

                    return $reduced;
                }

                // Otherwise
                $topstate = $stack[count($stack) - 1];
                $stack[] = $reduced;
                $next = $this->tables->get_goto($topstate, $nt_id);
                if ($next === null) {
                    throw new stack_maxima_parser_exception(
                        "No goto for state $topstate nonterminal $nt_id = $nt_name",
                        [],
                        $t,
                        $lexer->original,
                        $previous,
                        array_filter($stack, 'stack_maxima_parser_exception_partial_filter')
                    );
                } else {
                    $stack[] = $next;
                }

                // After reduce the last whitespace was inside something.
                $whitespaceseen = false;
            }
        }
    }

    ###functions###
}