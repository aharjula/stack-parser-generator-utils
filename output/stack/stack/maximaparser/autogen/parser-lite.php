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


class stack_maxima_parser2_lite {
    private stack_maxima_parser_table_holder $tables;
    private stack_parser_options $options;

    // The selection of the correct reduce logic could be done
    // with a switch or a match, but then one would need to 
    // actually check for the value. Instead, we use an array:
    //  - Here rule-number maps to a tuple of number of items
    //    to extract from the stack and a function to give those to
    private static $reducemap = [
				[1,0],
				[3,1],
				[3,2],
				[3,3],
				[2,4],
				[0,5],
				[3,6],
				[0,5],
				[1,0],
				[1,9],
				[1,10],
				[1,11],
				[1,0],
				[1,13],
				[1,14],
				[1,0],
				[1,0],
				[1,0],
				[2,18],
				[2,4],
				[0,5],
				[2,4],
				[1,0],
				[1,0],
				[1,0],
				[1,0],
				[1,0],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,27],
				[2,37],
				[2,37],
				[3,39],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[3,61],
				[2,27],
				[2,27],
				[3,40],
				[3,40],
				[3,40],
				[3,40],
				[2,27],
				[3,40],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,70],
				[3,40],
				[3,40],
				[3,40],
				[3,40]
			];

    public function __construct(stack_parser_options $options) {
        $this->options = $options;
        $this->tables = stack_maxima_parser_table_holder::get_for_grammar('lalr-lite.json');
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
                        foreach ($reduced->items as $item) {
                            while ($commenttoassign !== null &&
                                $commenttoassign->position['start'] < $item->position['start']) {
                                $interleaved[] = $commenttoassign;
                                $commenttoassign = array_shift($commentdump);
                            }
                            while ($commenttoassign !== null &&
                                $commenttoassign->position['start'] < $item->position['end']) {
                                $item->internalcomments[] = $commenttoassign;
                                $commenttoassign = array_shift($commentdump);
                            }
                            $interleaved[] = $item;
                        } 
                        foreach ($commentdump as $commenttoassign) {
                            $interleaved[] = $commenttoassign;
                        }
                        $reduced->items = $interleaved;
                    }

                    // To work with previous logic, return null...
                    if ($reduced instanceof MP_Root && count($reduced->items) === 0) {
                        return(null);
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

    /**
	 * Reduce logic for rules:
	 * 0: Start ->   Statement
	 * 8: Statement ->   TopOp
	 * 12: Term ->   CallOrIndex?
	 * 15: IndexableOrCallable ->   List
	 * 16: IndexableOrCallable ->   Set
	 * 17: IndexableOrCallable ->   Group
	 * 22: TopOp ->   OpInfix
	 * 23: TopOp ->   OpSuffix
	 * 24: TopOp ->   OpPrefix
	 * 25: TopOp ->   Term
	 * 26: TopOp ->   Abs
	 */
	private function r0($term0) {
		$term = $term0;
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 1: List ->   [  StatementNullList  ]
	 */
	private function r1($term2, $term1, $term0) {
		$term = new MP_List($term1);
		$term->set_position_from_parser_tokens($term0, $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 2: Set ->   {  StatementNullList  }
	 */
	private function r2($term2, $term1, $term0) {
		$term = new MP_Set($term1);
		$term->set_position_from_parser_tokens($term0, $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 3: Group ->   (  StatementNullList  )
	 */
	private function r3($term2, $term1, $term0) {
		$term = new MP_Group($term1);
		$term->set_position_from_parser_tokens($term0, $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 4: StatementNullList ->   Statement  TermList
	 * 19: ListsOrGroups ->   List  ListsOrGroups
	 * 21: ListsOrGroups ->   Group  ListsOrGroups
	 */
	private function r4($term1, $term0) {
		$term = array_merge([$term0], $term1);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 5: StatementNullList ->   END OF FILE
	 * 7: TermList ->   END OF FILE
	 * 20: ListsOrGroups ->   END OF FILE
	 */
	private function r5() {
		$term = [];
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 6: TermList ->   LIST SEP  Statement  TermList
	 */
	private function r6($term2, $term1, $term0) {
		$term = array_merge([$term1], $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 9: Term ->   BOOL
	 */
	private function r9($term0) {
		$term = new MP_Boolean($term0->value === 'true');
		$term->set_position_from_parser_token($term0);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 10: Term ->   INT
	 */
	private function r10($term0) {
		$term = new MP_Integer($term0->value, $term0->value);
		$term->set_position_from_parser_token($term0);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 11: Term ->   FLOAT
	 */
	private function r11($term0) {
		$term = new MP_Float($term0->value, $term0->value);
		$term->set_position_from_parser_token($term0);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 13: IndexableOrCallable ->   STRING
	 */
	private function r13($term0) {
		$term = new MP_String($term0->value);
		$term->set_position_from_parser_token($term0);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 14: IndexableOrCallable ->   ID
	 */
	private function r14($term0) {
		$term = new MP_Identifier($term0->value);
		$term->set_position_from_parser_token($term0);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 18: CallOrIndex? ->   IndexableOrCallable  ListsOrGroups
	 */
	private function r18($term1, $term0) {
		$term = $term0;
		while (count($term1) > 0) {
			$item = array_shift($term1);
			if ($item instanceof MP_List) {
				$term = new MP_Indexing($term, [$item]);
			} else if ($item instanceof MP_Group) {
				$term = new MP_FunctionCall($term, $item->items);
			}
			$term->set_position_from_nodes($term0, $item);
		}
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 27: OpPrefix ->   -  TopOp
	 * 28: OpPrefix ->   +  TopOp
	 * 29: OpPrefix ->   +-  TopOp
	 * 30: OpPrefix ->   ''  TopOp
	 * 31: OpPrefix ->   '  TopOp
	 * 32: OpPrefix ->   not  TopOp
	 * 33: OpPrefix ->   not   TopOp
	 * 34: OpPrefix ->   ??   TopOp
	 * 35: OpPrefix ->   ?   TopOp
	 * 36: OpPrefix ->   ?  TopOp
	 * 62: OpPrefix ->   nounnot  TopOp
	 * 63: OpPrefix ->   %not  TopOp
	 * 68: OpPrefix ->   nounnot   TopOp
	 */
	private function r27($term1, $term0) {
		$term = new MP_PrefixOp($term0->value, $term1);
		$term->set_position_from_token_node($term0, $term1);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 37: OpSuffix ->   TopOp  !
	 * 38: OpSuffix ->   TopOp  !!
	 */
	private function r37($term1, $term0) {
		$term = new MP_PostfixOp($term1->value, $term0);
		$term->set_position_from_node_token($term0, $term1);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 39: OpInfix ->   TopOp  *  TopOp
	 */
	private function r39($term2, $term1, $term0) {
		$term = new MP_Operation($term1->value, $term0, $term2);
		$term->set_position_from_nodes($term0, $term2);
		if ($term1->note !== null) {
			$term->position[$term1->note === 'inserted with whitespace' ? 'fixspaces' : 'insertstars'] = true;
		}
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 40: OpInfix ->   TopOp  **  TopOp
	 * 41: OpInfix ->   TopOp  ^^  TopOp
	 * 42: OpInfix ->   TopOp  ^  TopOp
	 * 43: OpInfix ->   TopOp  .  TopOp
	 * 44: OpInfix ->   TopOp  #  TopOp
	 * 45: OpInfix ->   TopOp  /  TopOp
	 * 46: OpInfix ->   TopOp  -  TopOp
	 * 47: OpInfix ->   TopOp  +  TopOp
	 * 48: OpInfix ->   TopOp  +-  TopOp
	 * 49: OpInfix ->   TopOp  and  TopOp
	 * 50: OpInfix ->   TopOp  or  TopOp
	 * 51: OpInfix ->   TopOp  ::=  TopOp
	 * 52: OpInfix ->   TopOp  :=  TopOp
	 * 53: OpInfix ->   TopOp  ::  TopOp
	 * 54: OpInfix ->   TopOp  :  TopOp
	 * 55: OpInfix ->   TopOp  <=  TopOp
	 * 56: OpInfix ->   TopOp  <  TopOp
	 * 57: OpInfix ->   TopOp  >=  TopOp
	 * 58: OpInfix ->   TopOp  >  TopOp
	 * 59: OpInfix ->   TopOp  =  TopOp
	 * 60: OpInfix ->   TopOp  ~  TopOp
	 * 64: OpInfix ->   TopOp  %and  TopOp
	 * 65: OpInfix ->   TopOp  %or  TopOp
	 * 66: OpInfix ->   TopOp  nounmul  TopOp
	 * 67: OpInfix ->   TopOp  @  TopOp
	 * 69: OpInfix ->   TopOp  implies  TopOp
	 * 82: OpInfix ->   TopOp  xor  TopOp
	 * 83: OpInfix ->   TopOp  xnor  TopOp
	 * 84: OpInfix ->   TopOp  nor  TopOp
	 * 85: OpInfix ->   TopOp  nand  TopOp
	 */
	private function r40($term2, $term1, $term0) {
		$term = new MP_Operation($term1->value, $term0, $term2);
		$term->set_position_from_nodes($term0, $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 61: Abs ->   |  TopOp  |
	 */
	private function r61($term2, $term1, $term0) {
		$term = new MP_FunctionCall(new MP_Identifier('abs'), [$term1]);
		$term->set_position_from_parser_tokens($term0, $term2);
	
		return $term;
	}
	
	/**
	 * Reduce logic for rules:
	 * 70: OpInfix ->   TopOp   ^-  TopOp
	 * 71: OpInfix ->   TopOp   ^+  TopOp
	 * 72: OpInfix ->   TopOp   ^+-  TopOp
	 * 73: OpInfix ->   TopOp   ^#pm#  TopOp
	 * 74: OpInfix ->   TopOp   **-  TopOp
	 * 75: OpInfix ->   TopOp   **+  TopOp
	 * 76: OpInfix ->   TopOp   **+-  TopOp
	 * 77: OpInfix ->   TopOp   **#pm#  TopOp
	 * 78: OpInfix ->   TopOp   ^^-  TopOp
	 * 79: OpInfix ->   TopOp   ^^+  TopOp
	 * 80: OpInfix ->   TopOp   ^^+-  TopOp
	 * 81: OpInfix ->   TopOp   ^^#pm#  TopOp
	 */
	private function r70($term2, $term1, $term0) {
		list($op1, $op2) = $term1->split();
		$term = new MP_Operation($op1->value, $term0, new MP_PrefixOp($op2->value, $term2));
		$term->set_position_from_nodes($term0, $term2);
		$term->rhs->set_position_from_token_node($op2, $term2);
	
		return $term;
	}
}